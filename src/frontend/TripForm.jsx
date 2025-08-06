import React, { useState, useEffect } from 'react';
import './TripForm.css';
import { parseISO, isAfter, isBefore, isEqual } from 'date-fns';

const TripForm = () => {
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weatherVisible, setWeatherVisible] = useState(false);
  const [weatherData, setWeatherData] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending to backend:", city, startDate, endDate);

    const response = await fetch("http://localhost:8000/trips/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, start_date: startDate, end_date: endDate }),
    });

    if (!response.ok) {
      console.error("Failed to save trip");
      return;
    }

    const result = await response.json();
    console.log("Trip saved:", result);
    setWeatherVisible(true);
  };

  useEffect(() => {
    const fetchWeather = async () => {
      if (!weatherVisible || !city || !startDate || !endDate) return;

      try {
        const res = await fetch(`http://localhost:8000/weather/${city}`);
        const data = await res.json();
        console.log("RAW DATA FROM API:", data);

        if (data.error) {
          setError(data.error);
          return;
        }

        const start = parseISO(startDate);
        const end = parseISO(endDate);

        const filtered = data.list.filter((entry) => {
          const entryDateTime = entry.dt_txt;
          const entryDate = parseISO(entryDateTime.split(' ')[0]);

          return (
            entryDateTime.includes("12:00:00") &&
            (
              isEqual(entryDate, start) ||
              isEqual(entryDate, end) ||
              (isAfter(entryDate, start) && isBefore(entryDate, end))
            )
          );
        });

        setWeatherData(filtered);
        setError(null);

      } catch (err) {
        setError("Error.");
      }
    };

    fetchWeather();
  }, [weatherVisible, city, startDate, endDate]);

  return (
    <div>
      <h1>Plan Your Trip (Only next 5 days)</h1>
      <form onSubmit={handleSubmit}>
        <label>City</label><br />
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="e.g. Paris"
          required
        /><br />

        <label>Start Date</label><br />
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          required
        /><br />

        <label>End Date</label><br />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          required
        /><br />

        <button type="submit">Create Trip</button>
      </form>

      {weatherVisible && (
        <>
          <h2>Weather Forecast in {city}</h2>
          {error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : weatherData.length === 0 ? (
            <p>No forecast data available for selected dates.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Temperature (°C)</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {weatherData.map((entry) => (
                  <tr key={entry.dt}>
                    <td>{entry.dt_txt.split(' ')[0]}</td>
                    <td>{entry.main.temp.toFixed(1)}</td>
                    <td>{entry.weather[0].description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default TripForm;
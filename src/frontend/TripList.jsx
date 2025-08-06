import React, { useEffect, useState } from 'react';
import './TripList.css';
import { parseISO, isAfter, isBefore, isEqual } from 'date-fns';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    city: '',
    start_date: '',
    end_date: ''
  });

  const [selectedTripWeather, setSelectedTripWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    const res = await fetch('http://localhost:8000/trips/');
    const data = await res.json();
    setTrips(data);
  };

  const handleEdit = (trip) => {
    setEditingId(trip.id);
    setFormData({
      city: trip.city,
      start_date: trip.start_date,
      end_date: trip.end_date,
    });
  };

  const handleSave = async (id) => {
    await fetch(`http://localhost:8000/trips/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setEditingId(null);
    fetchTrips();
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:8000/trips/${id}`, {
      method: 'DELETE',
    });
    fetchTrips();
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleShowWeather = async (trip) => {
    try {
      const res = await fetch(`http://localhost:8000/weather/${trip.city}`);
      const data = await res.json();

      const start = parseISO(trip.start_date);
      const end = parseISO(trip.end_date);

      const dailyForecasts = {};

      data.list.forEach((entry) => {
        const [dateStr, timeStr] = entry.dt_txt.split(" ");
        const date = parseISO(dateStr);
        const hour = parseInt(timeStr.split(":")[0]);

        if (
          isEqual(date, start) ||
          isEqual(date, end) ||
          (isAfter(date, start) && isBefore(date, end))
        ) {
          const current = dailyForecasts[dateStr];
          const diff = Math.abs(hour - 12);

          if (!current || diff < Math.abs(parseInt(current.dt_txt.split(" ")[1].split(":")[0]) - 12)) {
            dailyForecasts[dateStr] = entry;
          }
        }
      });

      const filtered = Object.values(dailyForecasts).sort((a, b) =>
        a.dt_txt.localeCompare(b.dt_txt)
      );

      if (filtered.length === 0) {
        setError("No forecast on this dates.");
        setSelectedTripWeather(null);
      } else {
        setSelectedTripWeather({ city: trip.city, data: filtered });
        setError(null);
      }
    } catch (err) {
      setError("Error.");
    }
  };

  return (
    <div className='container'>
      <h1>Saved Trips</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>City</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trips.map(trip => (
            <tr key={trip.id}>
              <td>{trip.id}</td>
              {editingId === trip.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSave(trip.id)}>Save</button>
                    <button onClick={() => handleDelete(trip.id)}>Delete</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{trip.city}</td>
                  <td>{trip.start_date}</td>
                  <td>{trip.end_date}</td>
                  <td>
                    <button onClick={() => handleEdit(trip)}>Edit</button>
                    <button onClick={() => handleDelete(trip.id)}>Delete</button>
                    <button onClick={() => handleShowWeather(trip)}>Show Weather</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedTripWeather && (
        <>
          <h2>Weather in {selectedTripWeather.city}</h2>
          <div className="container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Temperature (°C)</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {selectedTripWeather.data.map(entry => (
                <tr key={entry.dt}>
                  <td>{entry.dt_txt.split(' ')[0]}</td>
                  <td>{entry.main.temp.toFixed(1)}</td>
                  <td>{entry.weather[0].description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      {error && <p>{error}</p>}
    </div>
  );
};

export default TripList;
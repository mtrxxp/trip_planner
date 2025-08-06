import React, { useState, useEffect } from 'react';
import './TripForm.css';
import { parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const TripForm = () => {
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weatherVisible, setWeatherVisible] = useState(false);
  const [weatherData, setWeatherData] = useState([]);
  const [error, setError] = useState(null);

  const [coordinates, setCoordinates] = useState(null);

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

    const [cityName, countryCode] = city.split(',').map(s => s.trim());
    await fetchCityCoordinates(cityName, countryCode);
  };

  const fetchCityCoordinates = async (cityName, countryCode) => {
  try {
    let url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(cityName)}`;
    if (countryCode) {
      url += `&countryIds=${countryCode.toUpperCase()}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '0cc1bf09f0msh36afe14a1ac7acfp13e7fcjsn7b33dcec0b1d',
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
      },
    });

    if (!res.ok) {
      throw new Error(`API error, status: ${res.status}`);
    }

    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('No city data found');
    }

    const filteredCities = data.data.filter(c => {
      const cityMatch = c.name.toLowerCase() === cityName.toLowerCase();
      const countryMatch = countryCode ? c.countryCode.toUpperCase() === countryCode.toUpperCase() : true;
      return cityMatch && countryMatch;
    });

    const cityData = filteredCities.length > 0 ? filteredCities[0] : data.data[0];

    if (
      typeof cityData.latitude === 'number' &&
      typeof cityData.longitude === 'number'
    ) {
      setCoordinates({ lat: cityData.latitude, lon: cityData.longitude });
    } else {
      setCoordinates(null);
    }
  } catch (err) {
    console.error("Error fetching city coordinates:", err);
    setCoordinates(null);
  }
};

  useEffect(() => {
    const fetchWeather = async () => {
      if (!weatherVisible || !city) return;
      try {
        const res = await fetch(`http://localhost:8000/weather/${city}`);
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          const filtered = data.list.filter((entry) => {
            const entryDate = parseISO(entry.dt_txt.split(' ')[0]);
            const start = parseISO(startDate);
            const end = parseISO(endDate);

            return (
              entry.dt_txt.includes("12:00:00") &&
              (isEqual(entryDate, start) || isEqual(entryDate, end) ||
                (isAfter(entryDate, start) && isBefore(entryDate, end)))
            );
          });

          setWeatherData(filtered);
          setError(null);
        }
      } catch (err) {
        setError("Error.");
      }
    };

    fetchWeather();
  }, [weatherVisible, city, startDate, endDate]);

  const isValidCoordinates = (coords) => {
    return coords && typeof coords.lat === 'number' && typeof coords.lon === 'number';
  };

  return (
    <div>
      <h1>Plan Your Trip (For next 5 days)</h1>
      <form onSubmit={handleSubmit}>
        <label>City</label><br />
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="e.g. Paris or Paris, FR"
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
            <p>{error}</p>
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

      {isValidCoordinates(coordinates) && (
        <div className='map' style={{ height: '400px', marginTop: '20px' }}>
          <MapContainer center={[coordinates.lat, coordinates.lon]} zoom={12} style={{ height: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[coordinates.lat, coordinates.lon]}>
              <Popup>{city}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default TripForm;
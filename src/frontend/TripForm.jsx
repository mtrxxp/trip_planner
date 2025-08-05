import React, { useState } from 'react';
import './TripForm.css';

const TripForm = () => {
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

    setCity('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div>
      <h1>Plan Your Trip</h1>
      <form onSubmit={handleSubmit}>
        <label>City</label><br />
        <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Paris" required /><br />

        <label>Start Date</label><br />
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /><br />

        <label>End Date</label><br />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required /><br />

        <button type="submit">Create Trip</button>
      </form>
    </div>
  );
};

export default TripForm;

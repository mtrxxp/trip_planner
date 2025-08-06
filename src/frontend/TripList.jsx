import React, { useEffect, useState } from 'react';
import './TripList.css';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    city: '',
    start_date: '',
    end_date: ''
  });

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

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:8000/trips/${id}`, {
      method: 'DELETE',
    });
    fetchTrips();
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
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TripList;
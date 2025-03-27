// src/pages/ResidentBookings.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ResidentBookings = () => {
  const { user } = useContext(AuthContext);
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [newBooking, setNewBooking] = useState({ facility_id: '', slot: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'resident') {
      navigate('/login');
      return;
    }
    fetchFacilities();
    fetchBookings();
  }, [user, navigate]);

  const fetchFacilities = async () => {
    try {
      console.log('Fetching facilities');
      const response = await axios.get('http://localhost:8000/api/facilities');
      console.log('Facilities fetched:', response.data);
      setFacilities(response.data);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Failed to fetch facilities');
    }
  };

  const fetchBookings = async () => {
    try {
      console.log('Fetching bookings for user:', user._id);
      const response = await axios.get('http://localhost:8000/api/bookings', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log('Bookings fetched:', response.data);
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.detail || 'Failed to fetch bookings');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      if (!newBooking.facility_id || !newBooking.slot) {
        setError('Please select a facility and a slot');
        return;
      }
      const payload = { facility_id: newBooking.facility_id, slot: newBooking.slot };
      console.log('Creating booking:', payload);
      const response = await axios.post(
        'http://localhost:8000/api/bookings',
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      console.log('Booking created:', response.data);
      setNewBooking({ facility_id: '', slot: '' });
      fetchFacilities();
      fetchBookings();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error creating booking:', err);
      // Ensure error is a string
      const errorMessage = err.response?.data?.detail
        ? typeof err.response.data.detail === 'string'
          ? err.response.data.detail
          : JSON.stringify(err.response.data.detail)
        : 'Failed to create booking';
      setError(errorMessage);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Book a Facility</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <h3>Create a Booking</h3>
      <form onSubmit={handleBooking} className="mb-4">
        <div className="mb-3">
          <label htmlFor="facility" className="form-label">Facility</label>
          <select
            id="facility"
            className="form-control"
            value={newBooking.facility_id}
            onChange={(e) => setNewBooking({ ...newBooking, facility_id: e.target.value })}
            required
          >
            <option value="">Select a facility</option>
            {facilities.map((facility) => (
              <option key={facility._id} value={facility._id}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="slot" className="form-label">Available Slot</label>
          <select
            id="slot"
            className="form-control"
            value={newBooking.slot}
            onChange={(e) => setNewBooking({ ...newBooking, slot: e.target.value })}
            required
          >
            <option value="">Select a slot</option>
            {newBooking.facility_id &&
              facilities
                .find((f) => f._id === newBooking.facility_id)
                ?.available_slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Book</button>
      </form>

      <h3>Your Bookings</h3>
      <div className="list-group">
        {bookings.map((booking) => (
          <div key={booking._id} className="list-group-item">
            <strong>{booking.facility_name}</strong>
            <p>Slot: {booking.slot}</p>
            <p>Booked on: {booking.booked_at}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResidentBookings;
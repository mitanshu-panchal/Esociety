// src/pages/AdminBookings.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/bookings', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBookings(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      }
    };
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBookings(bookings.filter((b) => b._id !== bookingId));
      alert('Booking canceled successfully');
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  if (loading) return <div className="spinner-border mx-auto d-block mt-5" role="status"></div>;

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#333' }}>
        Manage Bookings
      </h2>
      {bookings.length === 0 ? (
        <p className="text-center">No bookings found.</p>
      ) : (
        <ul className="list-group">
          {bookings.map((booking) => (
            <li
              key={booking._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{booking.facility_name}</strong> - {booking.slot}
                <br />
                <small className="text-muted">Booked on: {booking.booked_at}</small>
              </div>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleCancelBooking(booking._id)}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminBookings;
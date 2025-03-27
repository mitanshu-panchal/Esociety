// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    complaints: 0,
    bookings: 0,
    pendingVisitors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [complaintsRes, bookingsRes, visitorsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/admin/complaints', {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get('http://localhost:8000/api/admin/bookings', {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get('http://localhost:8000/api/admin/visitors', {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);
        setStats({
          complaints: complaintsRes.data.length,
          bookings: bookingsRes.data.length,
          pendingVisitors: visitorsRes.data.filter((v) => v.status === 'pending').length,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) return <div className="spinner-border mx-auto d-block mt-5" role="status"></div>;

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#333' }}>
        Admin Dashboard
      </h2>
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h5 className="card-title">Total Complaints</h5>
              <p className="card-text display-4">{stats.complaints}</p>
              <Link to="/admin/complaints" className="btn btn-primary" style={{ backgroundColor: '#00C4B4', borderColor: '#00C4B4' }}>
                Manage Complaints
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h5 className="card-title">Total Bookings</h5>
              <p className="card-text display-4">{stats.bookings}</p>
              <Link to="/admin/bookings" className="btn btn-primary" style={{ backgroundColor: '#00C4B4', borderColor: '#00C4B4' }}>
                Manage Bookings
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h5 className="card-title">Pending Visitors</h5>
              <p className="card-text display-4">{stats.pendingVisitors}</p>
              <Link to="/admin/visitors" className="btn btn-primary" style={{ backgroundColor: '#00C4B4', borderColor: '#00C4B4' }}>
                Manage Visitors
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center mt-4">
        <Link to="/admin/facilities" className="btn btn-secondary">
          Manage Facilities
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
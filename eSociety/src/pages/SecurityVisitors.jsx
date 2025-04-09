// src/pages/SecurityDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SecurityDashboard = () => {
  const { user } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'security') {
      navigate('/login');
      return;
    }
    fetchVisitors();
  }, [user, navigate]);

  const fetchVisitors = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/security/visitors', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setVisitors(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch visitors');
    }
  };

  const pendingVisitors = visitors.filter(v => v.status === 'pending').length;
  const recentEntries = visitors.filter(v => v.status === 'entered').slice(0, 5);

  return (
    <div className="container py-5">
      <h2 className="mb-4">Security Dashboard</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Pending Visitors</h5>
              <p className="card-text">{pendingVisitors}</p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-4">Recent Entries</h3>
      <div className="list-group">
        {recentEntries.map((visitor) => (
          <div key={visitor._id} className="list-group-item">
            <strong>{visitor.name}</strong>
            <p>Purpose: {visitor.purpose}</p>
            <p>Status: {visitor.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityDashboard;
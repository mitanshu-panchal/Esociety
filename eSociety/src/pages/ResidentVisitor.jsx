// src/pages/ResidentVisitors.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ResidentVisitors = () => {
  const { user } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'resident') {
      navigate('/login');
      return;
    }
    fetchVisitors();
  }, [user, navigate]);

  const fetchVisitors = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/visitors/pending', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setVisitors(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch visitors');
    }
  };

  const handleDecision = async (visitorId, decision) => {
    try {
      await axios.post(
        `http://localhost:8000/api/visitors/${visitorId}/${decision}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchVisitors();
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${decision} visitor`);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Pending Visitors</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <h3>Visitors Awaiting Approval</h3>
      <div className="list-group">
        {visitors.map((visitor) => (
          <div key={visitor._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{visitor.name}</strong>
              <p>Purpose: {visitor.purpose}</p>
              <p>Status: {visitor.status}</p>
              <p>Created on: {new Date(visitor.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <button
                className="btn btn-success me-2"
                onClick={() => handleDecision(visitor._id, 'approve')}
              >
                Approve
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDecision(visitor._id, 'deny')}
              >
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResidentVisitors;
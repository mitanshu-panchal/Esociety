// src/pages/AdminComplaints.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminComplaints = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, [user, navigate]);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/complaints', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setComplaints(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch complaints');
    }
  };

  const handleResolve = async (complaintId) => {
    try {
      await axios.post(
        `http://localhost:8000/api/admin/complaints/${complaintId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resolve complaint');
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Manage Complaints</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <h3>All Complaints</h3>
      <div className="list-group">
        {complaints.map((complaint) => (
          <div key={complaint._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{complaint.title}</strong>
              <p>{complaint.description}</p>
              <p>Status: {complaint.status}</p>
              <p>Filed by Resident ID: {complaint.resident_id}</p>
              <p>Filed on: {new Date(complaint.created_at).toLocaleDateString()}</p>
            </div>
            {complaint.status === 'pending' && (
              <button
                className="btn btn-success"
                onClick={() => handleResolve(complaint._id)}
              >
                Resolve
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminComplaints;
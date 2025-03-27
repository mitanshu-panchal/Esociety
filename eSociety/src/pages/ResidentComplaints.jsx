// src/pages/ResidentComplaints.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ResidentComplaints = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [newComplaint, setNewComplaint] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'resident') {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, [user, navigate]);

  const fetchComplaints = async () => {
    try {
      console.log('Fetching complaints for user:', user._id);
      const response = await axios.get('http://localhost:8000/api/complaints', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log('Complaints fetched:', response.data);
      setComplaints(response.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.response?.data?.detail || 'Failed to fetch complaints');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newComplaint.title || !newComplaint.description) {
        setError('Please provide both an issue type and description');
        return;
      }
      const payload = { title: newComplaint.title, description: newComplaint.description };
      console.log('Submitting complaint:', payload);
      const response = await axios.post(
        'http://localhost:8000/api/complaints',
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      console.log('Complaint submitted:', response.data);
      setNewComplaint({ title: '', description: '' });
      fetchComplaints();
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(err.response?.data?.detail || 'Failed to submit complaint');
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Complaint Tracking</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <h3>File a New Complaint</h3>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label htmlFor="issueType" className="form-label">Issue Type</label>
          <select
            id="issueType"
            className="form-control"
            value={newComplaint.title}
            onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
            required
          >
            <option value="">Select an issue type</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Noise">Noise</option>
            <option value="Parking">Parking</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            className="form-control"
            value={newComplaint.description}
            onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>

      <h3>Your Complaints</h3>
      <div className="list-group">
        {complaints.map((complaint) => (
          <div key={complaint._id} className="list-group-item">
            <strong>{complaint.title}</strong>
            <p>{complaint.description}</p>
            <p>Status: {complaint.status}</p>
            <p>Filed on: {new Date(complaint.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResidentComplaints;
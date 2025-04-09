// src/pages/SecurityDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SecurityDashboard = () => {
  const { user } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);
  const [error, setError] = useState('');
  const [newVisitor, setNewVisitor] = useState({ name: '', purpose: '' });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVisitor((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    setSuccessMessage('');
  };

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!newVisitor.name || !newVisitor.purpose) {
      setFormError('Both name and purpose are required.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/security/visitors',
        {
          name: newVisitor.name,
          purpose: newVisitor.purpose,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setNewVisitor({ name: '', purpose: '' });
      setSuccessMessage('Visitor added successfully!');
      fetchVisitors();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to add visitor');
    }
  };

  const pendingVisitors = visitors.filter((v) => v.status === 'pending').length;
  const recentEntries = visitors.filter((v) => v.status === 'entered').slice(0, 5);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <div className="bg-dark" style={{ width: '250px', padding: '20px', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
        <h4 className="mb-4">Security Menu</h4>
        <ul className="list-unstyled">
          <li className="mb-2">
            <a href="#dashboard" className="sidebar-link">
              Dashboard
            </a>
          </li>
          <li className="mb-2">
            <a href="#visitors" className="sidebar-link">
              Manage Visitors
            </a>
          </li>
        </ul>
      </div>

      <div className="container" style={{ marginLeft: '250px', padding: '40px 20px' }}>
        <h2 className="mb-4">Security Dashboard</h2>
        {error && <div className="alert alert-danger mb-4">{error}</div>}

        <div className="row mb-5">
          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Pending Visitors</h5>
                <p className="card-text display-4">{pendingVisitors}</p>
              </div>
            </div>
          </div>
          <div className="col-md-8 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Quick Actions</h5>
                <p className="card-text">
                  Use the form below to add a new visitor and manage security tasks efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-5">
          <div className="card-body">
            <h3 className="card-title mb-4">Add New Visitor</h3>
            {formError && <div className="alert alert-danger mb-4">{formError}</div>}
            {successMessage && <div className="alert alert-success mb-4">{successMessage}</div>}
            <form onSubmit={handleAddVisitor}>
              <div className="mb-3">
                <label htmlFor="visitorName" className="form-label">
                  Visitor Name
                </label>
                <input
                  type="text"
                  id="visitorName"
                  name="name"
                  className="form-control"
                  value={newVisitor.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="visitorPurpose" className="form-label">
                  Purpose of Visit
                </label>
                <textarea
                  id="visitorPurpose"
                  name="purpose"
                  className="form-control"
                  value={newVisitor.purpose}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Visitor
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="card-title mb-4">Recent Entries</h3>
            {recentEntries.length === 0 ? (
              <p className="card-text">No recent entries available.</p>
            ) : (
              <div className="list-group">
                {recentEntries.map((visitor) => (
                  <div key={visitor._id} className="list-group-item">
                    <strong>{visitor.name}</strong>
                    <p>Purpose: {visitor.purpose}</p>
                    <p>Status: {visitor.status}</p>
                    <p>
                      Last Updated:{' '}
                      {visitor.updated_at
                        ? new Date(visitor.updated_at).toLocaleString()
                        : new Date(visitor.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
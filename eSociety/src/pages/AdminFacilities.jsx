// src/pages/AdminFacilities.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminFacilities = () => {
  const { user } = useContext(AuthContext);
  const [facilities, setFacilities] = useState([]);
  const [newFacility, setNewFacility] = useState({ name: '', available_slots: '' });
  const [editFacility, setEditFacility] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchFacilities();
  }, [user, navigate]);

  const fetchFacilities = async () => {
    try {
      console.log('Fetching facilities');
      const response = await axios.get('http://localhost:8000/api/facilities', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log('Facilities fetched:', response.data);
      setFacilities(response.data);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError(err.response?.data?.detail || 'Failed to fetch facilities');
    }
  };

  const handleAddFacility = async (e) => {
    e.preventDefault();
    try {
      const slots = newFacility.available_slots.split(',').map(slot => slot.trim()).filter(slot => slot);
      if (!newFacility.name || slots.length === 0) {
        setError('Please provide a name and at least one valid slot');
        return;
      }
      const payload = { name: newFacility.name, available_slots: slots };
      console.log('Adding facility:', payload);
      const response = await axios.post(
        'http://localhost:8000/api/admin/facilities',
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      console.log('Facility added:', response.data);
      setNewFacility({ name: '', available_slots: '' });
      fetchFacilities();
    } catch (err) {
      console.error('Error adding facility:', err);
      setError(err.response?.data?.detail || 'Failed to add facility');
    }
  };

  const handleEditFacility = (facility) => {
    setEditFacility(facility);
    setNewFacility({
      name: facility.name,
      available_slots: facility.available_slots.join(', '),
    });
  };

  const handleUpdateFacility = async (e) => {
    e.preventDefault();
    try {
      const slots = newFacility.available_slots.split(',').map(slot => slot.trim()).filter(slot => slot);
      if (!newFacility.name || slots.length === 0) {
        setError('Please provide a name and at least one valid slot');
        return;
      }
      const payload = { name: newFacility.name, available_slots: slots };
      console.log('Updating facility:', editFacility._id, payload);
      const response = await axios.put(
        `http://localhost:8000/api/admin/facilities/${editFacility._id}`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      console.log('Facility updated:', response.data);
      setNewFacility({ name: '', available_slots: '' });
      setEditFacility(null);
      fetchFacilities();
    } catch (err) {
      console.error('Error updating facility:', err);
      setError(err.response?.data?.detail || 'Failed to update facility');
    }
  };

  const handleDeleteFacility = async (facilityId) => {
    try {
      console.log('Deleting facility:', facilityId);
      const response = await axios.delete(
        `http://localhost:8000/api/admin/facilities/${facilityId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      console.log('Facility deleted:', response.data);
      fetchFacilities();
    } catch (err) {
      console.error('Error deleting facility:', err);
      setError(err.response?.data?.detail || 'Failed to delete facility');
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Manage Facilities</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <h3>{editFacility ? 'Edit Facility' : 'Add New Facility'}</h3>
      <form onSubmit={editFacility ? handleUpdateFacility : handleAddFacility} className="mb-4">
        <div className="mb-3">
          <label htmlFor="facilityName" className="form-label">Facility Name</label>
          <input
            type="text"
            id="facilityName"
            className="form-control"
            value={newFacility.name}
            onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="availableSlots" className="form-label">
            Available Slots (comma-separated, e.g., 09:00-10:00, 10:00-11:00)
          </label>
          <input
            type="text"
            id="availableSlots"
            className="form-control"
            value={newFacility.available_slots}
            onChange={(e) => setNewFacility({ ...newFacility, available_slots: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {editFacility ? 'Update Facility' : 'Add Facility'}
        </button>
        {editFacility && (
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => {
              setEditFacility(null);
              setNewFacility({ name: '', available_slots: '' });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <h3>Facilities</h3>
      <div className="list-group">
        {facilities.map((facility) => (
          <div key={facility._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{facility.name}</strong>
              <p>Slots: {facility.available_slots.join(', ')}</p>
            </div>
            <div>
              <button
                className="btn btn-warning btn-sm me-2"
                onClick={() => handleEditFacility(facility)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteFacility(facility._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFacilities;
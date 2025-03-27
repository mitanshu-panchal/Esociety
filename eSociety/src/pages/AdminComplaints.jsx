// src/pages/AdminComplaints.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminComplaints = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/complaints', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setComplaints(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        setLoading(false);
      }
    };
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const handleResolveComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to mark this complaint as resolved?')) return;
    try {
      await axios.post(
        `http://localhost:8000/api/admin/complaints/${complaintId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setComplaints(
        complaints.map((c) =>
          c._id === complaintId ? { ...c, status: 'resolved', resolved_at: new Date().toISOString() } : c
        )
      );
      alert('Complaint resolved successfully');
    } catch (error) {
      console.error('Error resolving complaint:', error);
      alert('Failed to resolve complaint');
    }
  };

  if (loading) return <div className="spinner-border mx-auto d-block mt-5" role="status"></div>;

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#333' }}>
        Manage Complaints
      </h2>
      {complaints.length === 0 ? (
        <p className="text-center">No complaints found.</p>
      ) : (
        <ul className="list-group">
          {complaints.map((complaint) => (
            <li
              key={complaint._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{complaint.title}</strong> - {complaint.description}
                <br />
                <small className="text-muted">
                  Status: {complaint.status} | Created: {new Date(complaint.created_at).toLocaleString()}
                  {complaint.status === 'resolved' && ` | Resolved: ${new Date(complaint.resolved_at).toLocaleString()}`}
                </small>
              </div>
              {complaint.status === 'pending' && (
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleResolveComplaint(complaint._id)}
                >
                  Resolve
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminComplaints;
// src/pages/AdminVisitors.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminVisitors = () => {
  const { user } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/visitors', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setVisitors(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching visitors:', error);
        setLoading(false);
      }
    };
    if (user) {
      fetchVisitors();
    }
  }, [user]);

  const handleVisitorAction = async (visitorId, decision) => {
    try {
      await axios.post(
        `http://localhost:8000/api/admin/visitors/${visitorId}/${decision}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setVisitors(
        visitors.map((v) =>
          v._id === visitorId ? { ...v, status: decision, handled_at: new Date().toISOString() } : v
        )
      );
      alert(`Visitor ${decision}ed`);
    } catch (error) {
      console.error(`Error ${decision}ing visitor:`, error);
      alert(`Failed to ${decision} visitor`);
    }
  };

  if (loading) return <div className="spinner-border mx-auto d-block mt-5" role="status"></div>;

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#333' }}>
        Manage Visitors
      </h2>
      {visitors.length === 0 ? (
        <p className="text-center">No visitors found.</p>
      ) : (
        <ul className="list-group">
          {visitors.map((visitor) => (
            <li
              key={visitor._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{visitor.name}</strong> - {visitor.purpose}
                <br />
                <small className="text-muted">
                  Time: {visitor.time} | Status: {visitor.status}
                  {visitor.handled_at && ` | Handled: ${new Date(visitor.handled_at).toLocaleString()}`}
                </small>
              </div>
              {visitor.status === 'pending' && (
                <div>
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => handleVisitorAction(visitor._id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleVisitorAction(visitor._id, 'deny')}
                  >
                    Deny
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminVisitors;
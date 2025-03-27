// src/pages/ResidentDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ResidentDashboard = () => {
  return (
    <div className="container-fluid py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1
        className="text-center mb-5"
        style={{
          fontWeight: 'bold',
          fontSize: '3rem',
          color: '#2c3e50',
          letterSpacing: '1px',
        }}
      >
        Welcome to eSociety
      </h1>
      <div className="row justify-content-center">
        <div className="col-md-4 col-lg-3 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title" style={{ fontSize: '1.5rem', color: '#34495e' }}>
                Visitor Management
              </h5>
              <p className="card-text text-muted">
                Approve or deny guest entries in real-time.
              </p>
              <Link
                to="/resident/visitors"
                className="btn btn-primary mt-3"
                style={{ backgroundColor: '#00C4B4', borderColor: '#00C4B4' }}
              >
                Manage Visitors
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-3 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title" style={{ fontSize: '1.5rem', color: '#34495e' }}>
                Complaint Tracking
              </h5>
              <p className="card-text text-muted">
                Report and track issues like maintenance.
              </p>
              <Link
                to="/resident/complaints"
                className="btn btn-primary mt-3"
                style={{ backgroundColor: '#00C4B4', borderColor: '#00C4B4' }}
              >
                File a Complaint
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-3 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title" style={{ fontSize: '1.5rem', color: '#34495e' }}>
                Facility Booking
              </h5>
              <p className="card-text text-muted">
                Book amenities like the gym or clubhouse.
              </p>
              <Link
                to="/resident/bookings"
                className="btn btn-primary mt-3"
                style={{ backgroundColor: '#00C4B4', borderColor: '#00C4B4' }}
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
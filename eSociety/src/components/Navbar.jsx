// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AppNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand" to="/" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          eSociety
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                {user.role === 'resident' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/resident/dashboard">
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/resident/visitors">
                        Visitors
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/resident/complaints">
                        Complaints
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/resident/bookings">
                        Bookings
                      </Link>
                    </li>
                  </>
                )}
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/dashboard">
                      Admin Panel
                    </Link>
                  </li>
                )}
                {user.role === 'security' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/security/log">
                      Security Log
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
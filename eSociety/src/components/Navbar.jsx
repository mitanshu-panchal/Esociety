// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHome, FaBook, FaExclamationCircle, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
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
                      <Link className="nav-link" to="/resident/Dashboard">
                        <FaBook /> Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/resident/bookings">
                        <FaBook /> Book Facility
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/resident/complaints">
                        <FaExclamationCircle /> Complaints
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/resident/visitors">
                        <FaUser /> Visitors
                      </Link>
                    </li>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/dashboard">
                        <FaHome /> Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/bookings">
                        <FaBook /> Bookings
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/complaints">
                        <FaExclamationCircle /> Complaints
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/visitors">
                        <FaUser /> Visitors
                      </Link>
                    </li>
                  </>
                )}
                {user.role === 'security' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/security/dashboard">
                        <FaHome /> Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/security/visitors">
                        <FaUser /> Visitors
                      </Link>
                    </li>
                  </>
                )}
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
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

export default Navbar;
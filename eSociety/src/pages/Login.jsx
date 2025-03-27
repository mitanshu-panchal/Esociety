// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('username', formData.email);
      formDataToSend.append('password', formData.password);

      console.log('Sending login request with:', formDataToSend.toString());
      const response = await axios.post('http://localhost:8000/login', formDataToSend, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log('Login response:', response.data);
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      console.log('Token stored in localStorage:', localStorage.getItem('token'));

      // Fetch user data and update AuthContext
      const userResponse = await axios.get('http://localhost:8000/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...userResponse.data, token });
      console.log('User data set in AuthContext:', userResponse.data);

      navigate('/resident/dashboard', { replace: true });
      console.log('Navigating to /resident/dashboard');

      // Fallback redirect
      setTimeout(() => {
        if (window.location.pathname !== '/resident/dashboard') {
          console.log('Fallback: Forcing redirect to /resident/dashboard');
          window.location.href = '/resident/dashboard';
        }
      }, 500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        (error.response?.data?.msg ? error.response.data.msg : 'Login failed');
      console.error('Login error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Login to eSociety</h3>
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <svg
                    className="bi flex-shrink-0 me-2"
                    width="24"
                    height="24"
                    role="img"
                    aria-label="Danger:"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                  </svg>
                  <div>{error}</div>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ backgroundColor: '#00C4B4', borderColor: '#00C4B4' }}
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
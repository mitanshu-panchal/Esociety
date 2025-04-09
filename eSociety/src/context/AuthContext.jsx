// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context with a default value
export const AuthContext = createContext({
  user: null,
  login: () => {}, // Default empty function to avoid undefined errors
  setUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/login', { username: email, password }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const { access_token } = response.data;
      const userResponse = await axios.get('http://localhost:8000/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const userData = { ...userResponse.data, token: access_token };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Login failed');
    }
  };

  // Log the value being provided to debug
  console.log('AuthProvider value:', { user, login, setUser });

  return (
    <AuthContext.Provider value={{ user, login, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
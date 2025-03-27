// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  console.log('ProtectedRoute - loading:', loading, 'user:', user);

  if (loading) {
    return <div className="spinner-border mx-auto d-block mt-5" role="status"></div>;
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to /login');
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - Role not allowed, redirecting to /login', user.role, allowedRoles);
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
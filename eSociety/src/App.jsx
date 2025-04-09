// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppNavbar from './components/Navbar';
import ResidentDashboard from './pages/ResidentDashboard';
import ResidentVisitor from './pages/ResidentVisitor';
import ResidentComplaints from './pages/ResidentComplaints';
import ResidentBookings from './pages/ResidentBookings';
import AdminDashboard from './pages/AdminDashboard'; // Added
import AdminFacilities from './pages/AdminFacilities'; // Added
import AdminComplaints from './pages/AdminComplaints'; // Added
import AdminBookings from './pages/AdminBookings'; // Added
import AdminVisitors from './pages/AdminVisitors'; // Added
import SecurityVisitors from './pages/SecurityVisitors';
import SecurityDashboard from './pages/SecurityDashboard'; // New
// import ResidentComplaints from './pages/ResidentComplaints'; // New
// import AdminComplaints from './pages/AdminComplaints';
import Login from './pages/Login';

const App = () => {
  console.log("AuthProvider rendering app");
  
  return (
    <AuthProvider>
      <Router>
        <AppNavbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/resident/dashboard"
            element={
              <ProtectedRoute allowedRoles={['resident']}>
                <ResidentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/visitors"
            element={
              <ProtectedRoute allowedRoles={['resident']}>
                <ResidentVisitor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/complaints"
            element={
              <ProtectedRoute allowedRoles={['resident']}>
                <ResidentComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/bookings"
            element={
              <ProtectedRoute allowedRoles={['resident']}>
                <ResidentBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/facilities"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminFacilities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/visitors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminVisitors />
              </ProtectedRoute>
            }
          />
          <Route path="/security/dashboard" element={<SecurityDashboard />} />
          <Route path="/security/visitors" element={<SecurityVisitors />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
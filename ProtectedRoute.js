import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    // User not authenticated, redirect to login page
    return <Navigate to="/" state={{ from: location }} replace />;
  } else if (allowedRoles && !allowedRoles.includes(userRole)) {
    // User does not have permission to view this page
    return <Navigate to="/notfound" replace />;
  }

  return children;
};

export default ProtectedRoute;

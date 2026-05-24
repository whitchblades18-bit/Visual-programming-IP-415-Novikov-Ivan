import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/mockAuthService';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return children;
}

export default ProtectedRoute;
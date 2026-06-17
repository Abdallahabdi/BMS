import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ user, children, message, adminOnly }) => {
  const location = useLocation();

  useEffect(() => {
    if (!user && message) {
      toast.info(message, {
        toastId: 'auth-required', // Prevent duplicate toasts
      });
    } else if (user && adminOnly && user.role !== 'admin') {
      toast.error('Giriideedkaani waa u gaar Maamulayaasha (Admins).', {
        toastId: 'admin-required',
      });
    }
  }, [user, message, adminOnly]);

  if (!user) {
    // Redirect to landing page if not logged in
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // Redirect normal users away from admin pages
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

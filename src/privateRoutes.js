import React, { useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from './providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import { coreLogger } from './core/logging/CoreLogger';
import { LOG_LEVELS } from './reducers/metadata/metadataReducer';

const PrivateRoute = ({ element }) => {
  const { currentUser, loading, isLoading } = useAuth();
  
  useEffect(() => {
    console.log('PrivateRoute', LOG_LEVELS.LIFECYCLE, 'Component mounted', isLoading, {
      isLoading: loading,
      hasUser: !!currentUser
    });

    return () => {
      console.log('PrivateRoute', LOG_LEVELS.LIFECYCLE, 'Component unmounting');
    };
  }, [loading, currentUser]);

  if (loading) {
    coreLogger('PrivateRoute', LOG_LEVELS.STATE, 'Showing loading state');
    return <CircularProgress />;
  }

  if (!currentUser) {
    console.log('PrivateRoute', LOG_LEVELS.STATE, 'Redirecting to login - unauthorized access attempt');
    return <Navigate to="/login" replace />;
  }

  console.log('PrivateRoute', LOG_LEVELS.STATE, 'Rendering protected content', {
    userId: currentUser.uid
  });

  return element;
};

export default PrivateRoute;
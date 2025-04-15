// src/components/Auth/AuthenticatedLayout.js
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LOG_LEVELS } from '../../core/constants.js';
import { coreLogger } from '../../core/logging';
import { ThemeControls } from '../../ThemeControls.js';
import Layout from '../Layout/Layout';
import TopNavBar from '../Layout/TopNavBar'; // Importe TopNavBar

const AuthenticatedLayout = () => {
  const location = useLocation();
  const startTime = performance.now();

  useEffect(() => {
    coreLogger.logServiceInitStart('AuthenticatedLayout', LOG_LEVELS.LIFECYCLE, 'Layout initialization', {
      path: location.pathname,
      startTimestamp: new Date().toISOString()
    });

    return () => {
      coreLogger.logServiceInitComplete('AuthenticatedLayout', LOG_LEVELS.LIFECYCLE, 'Layout cleanup', {
        path: location.pathname,
        duration: `${Math.round(performance.now() - startTime)}ms`,
        endTimestamp: new Date().toISOString()
      });
    };
  }, [location.pathname]);

  useEffect(() => {
    coreLogger.logEvent('AuthenticatedLayout', LOG_LEVELS.STATE, 'Authenticated route change', {
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname]);

  return (
    <Layout>
        <TopNavBar /> {/* TopNavBar agora está aqui DENTRO de AuthenticatedLayout */}
        <ThemeControls />
        <Outlet />
    </Layout>
  );
};

export default AuthenticatedLayout;
// src/AppRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProviderLogin from './components/Auth/ProviderLogin';
import Dashboard from './components/Dashboard/Dashboard';
import NotificationHistory from './components/Notification/NotificationHistory';

const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/provider-login" element={<ProviderLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/notifications" element={<NotificationHistory />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import NotificationHistory from './components/Notification/NotificationHistory';

const AppRoutes = ({ toggleTheme }) => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <Layout toggleTheme={toggleTheme}>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/notifications"
        element={
          <Layout toggleTheme={toggleTheme}>
            <NotificationHistory />
          </Layout>
        }
      />
      <Route
        path="/"
        element={
          <Layout toggleTheme={toggleTheme}>
            <Dashboard />
          </Layout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;

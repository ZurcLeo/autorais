// src/services/dashboardService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardData = async () => {
  try {
    const [caixinhas, notifications, messages, connections] = await Promise.all([
      api.get('/api/caixinha'),
      api.get('/api/notifications'),
      api.get('/api/messages'),
      api.get('/api/connections')
    ]);

    return {
      caixinhas: caixinhas.data,
      notifications: notifications.data,
      messages: messages.data,
      connections: connections.data,
      
    };
  } catch (error) {
    throw error;
  }
};
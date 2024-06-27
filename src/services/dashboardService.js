// src/services/dashboardService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL; 

export const getDashboardData = async () => {
  try {
    const [caixinhas, notifications, messages, connections] = await Promise.all([
      axios.get(`${API_URL}/api/caixinha`),
      axios.get(`${API_URL}/api/notifications`),
      axios.get(`${API_URL}/api/messages`),
      axios.get(`${API_URL}/api/connections`)
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
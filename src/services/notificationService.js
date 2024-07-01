import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchNotifications = async (userId) => {
  const response = await axios.get(`${API_URL}/notifications/${userId}`);
  return response.data;
};

export const markAsRead = async (userId, notificationId) => {
  await axios.post(`${API_URL}/notifications/${userId}/markAsRead`, { notificationId });
};

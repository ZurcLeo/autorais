import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: API,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
});

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const addUser = async (user) => {
  const response = await api.post('/users/add-user', user);
  return response.data;
};

export const updateUser = async (id, user) => {
  const response = await api.put(`/users/update-user/${id}`, user);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/delete-user/${id}`);
  return response.data;
};
import axios from 'axios';

const API = axios.create({ baseURL: '/api/users' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function updateProfile(formData) {
  return API.patch('/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export function checkUsername(name) {
  return API.get('/check-username', { params: { name } });
}

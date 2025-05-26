import axios from 'axios';

export const reportTarget = (type, targetId, url, reason = '') =>
  axios.post('/api/reports', { type, targetId, url, reason }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

export const unreportTarget = (type, targetId) =>
  axios.delete('/api/reports', {
    data: { type, targetId },
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

export const getAllReports = () =>
  axios.get('/api/reports', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
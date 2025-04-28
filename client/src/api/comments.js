import axios from 'axios';

const BASE = '/api/comments';

export const getComments   = (targetType, targetId) =>
  axios.get(BASE, { params: { targetType, targetId } });

export const postComment   = data =>
  axios.post(BASE, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

export const deleteComment = id =>
  axios.delete(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

export const likeComment   = id =>
  axios.post(`${BASE}/${id}/like`, {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

export const dislikeComment = id =>
  axios.post(`${BASE}/${id}/dislike`, {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

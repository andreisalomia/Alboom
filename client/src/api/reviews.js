import axios from 'axios';
const BASE = '/api/reviews';

export const getReviews  = (targetType, targetId) =>
  axios.get(BASE, { params: { targetType, targetId } });

export const toggleReview = ({ targetType, targetId, rating }) =>
  axios.post(BASE, { targetType, targetId, rating }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

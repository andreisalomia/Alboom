import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const participate = eventId =>
  API.post(`/events/${eventId}/participate`);

export const cancelParticipation = eventId =>
  API.delete(`/events/${eventId}/participate`);

export const fetchParticipants = eventId =>
  API.get(`/events/${eventId}/participants`);

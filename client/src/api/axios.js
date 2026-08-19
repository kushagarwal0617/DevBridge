import axios from 'axios';

// This is the ONE place your whole app talks to the backend.
// baseURL points to your local backend server during development.
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Before every request, this automatically attaches your login token
// (if you have one saved) so protected routes work without extra code.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

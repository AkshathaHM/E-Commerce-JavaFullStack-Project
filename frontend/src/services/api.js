import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxied to backend
  withCredentials: true, // Sends JWT cookie
});

export const userApi = {
  register: (userData) => api.post('/users/register', userData),
  login: (loginData) => api.post('/auth/login', loginData),
};

export default api;
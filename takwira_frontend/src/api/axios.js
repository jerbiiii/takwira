import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh (optional logic can be added here)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const res = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', { refresh });
          localStorage.setItem('access', res.data.access);
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const tournamentsApi = {
  getRequests: () => api.get('tournaments/tournament-requests/'),
  createRequest: (data) => api.post('tournaments/tournament-requests/', data),
  approveRequest: (id, data) => api.patch(`tournaments/tournament-requests/${id}/approve/`, data),
  rejectRequest: (id, data) => api.patch(`tournaments/tournament-requests/${id}/reject/`, data),
  
  getJoinRequests: () => api.get('tournaments/join-requests/'),
  submitJoinRequest: (data) => api.post('tournaments/join-requests/', data),
  approveJoin: (id) => api.patch(`tournaments/join-requests/${id}/approve/`),
  rejectJoin: (id) => api.patch(`tournaments/join-requests/${id}/reject/`),
};

export default api;

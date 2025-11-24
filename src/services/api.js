import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Parking API
// In your parkingAPI object, add:
export const parkingAPI = {
  getAll: (params) => api.get('/parking/all', { params }),
  getById: (id) => api.get(`/parking/${id}`),
  add: (data) => api.post('/parking/add', data),
  update: (id, data) => api.put(`/parking/update/${id}`, data),
  delete: (id) => api.delete(`/parking/delete/${id}`),
  changeStatus: (id, data) => api.put(`/parking/change-status/${id}`, data),
  // Add this new method for admin
  getAllSpotsForAdmin: () => api.get('/parking/admin/all-spots'),
};

// Booking API
export const bookingAPI = {
  create: (data) => api.post('/booking/create', data),
  getUserBookings: (userId) => api.get(`/booking/user/${userId}`),
  getOwnerBookings: (ownerId) => api.get(`/booking/owner/${ownerId}`),
  cancel: (id) => api.put(`/booking/cancel/${id}`),
  delete: (id) => api.delete(`/booking/delete/${id}`),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  approveSpot: (id) => api.put(`/admin/spot/approve/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  deleteUser: (id) => api.delete(`/admin/user/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};


export default api;
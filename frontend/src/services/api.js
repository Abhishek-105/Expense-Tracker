import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('et_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle global response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('et_token');
      localStorage.removeItem('et_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data)  => API.post('/auth/register', data),
  login:    (data)  => API.post('/auth/login', data),
};

// User
export const userAPI = {
  getProfile:     ()     => API.get('/user/profile'),
  updateProfile:  (data) => API.put('/user/profile', data),
  changePassword: (data) => API.put('/user/change-password', data),
};

// Transactions
export const transactionAPI = {
  getAll:    (params) => API.get('/transactions', { params }),
  getSummary:(params) => API.get('/transactions/summary', { params }),
  create:    (data)   => API.post('/transactions', data),
  update:    (id, data) => API.put(`/transactions/${id}`, data),
  delete:    (id)     => API.delete(`/transactions/${id}`),
};

// Budget
export const budgetAPI = {
  get:        (month)    => API.get('/budget', { params: { month } }),
  set:        (data)     => API.post('/budget', data),
  update:     (id, data) => API.put(`/budget/${id}`, data),
  getHistory: ()         => API.get('/budget/history'),
};

export default API;

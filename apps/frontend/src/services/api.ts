import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // Extract error message
    let message = 'Terjadi kesalahan pada server.';
    if (error.response) {
      if (error.response.data?.message) {
        message = error.response.data.message;
      } else if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.status === 401) {
        message = 'Otorisasi gagal. Silakan login ulang.';
      } else if (error.response.status === 400) {
        message = 'Permintaan tidak valid.';
      }
    } else if (error.request) {
      message = 'Tidak ada respons dari server.';
    } else if (error.message) {
      message = error.message;
    }
    // Optionally: dispatch to global toast/alert system here
    // window.dispatchToast?.(message, 'error');
    return Promise.reject({ ...error, message });
  }
);

export default api;

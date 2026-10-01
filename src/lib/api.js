import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('stakelab_admin_token') || localStorage.getItem('digital_admin_token');
      if (!token && document.cookie) {
        const match = document.cookie.split('; ').find((row) =>
          row.startsWith('stakelab_admin_token=') || row.startsWith('sec-admin-token=') || row.startsWith('digital_admin_token=')
        );
        if (match) {
          token = match.split('=')[1];
        }
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const msg = String(error.response?.data?.message || error.response?.data?.error || '');
    const isExpired = status === 401 || status === 403 || msg.includes('jwt expired') || msg.includes('Invalid admin token');

    if (isExpired && typeof window !== 'undefined') {
      const authPages = ['/admin/login', '/admin/forgot-password', '/admin/reset-password', '/admin/verify-otp'];
      const isAuthPage = authPages.some((path) => window.location.pathname.startsWith(path));

      localStorage.removeItem('stakelab_admin_token');
      localStorage.removeItem('stakelab_admin');
      localStorage.removeItem('digital_admin_token');

      const isLocal = window.location.hostname.includes('localhost');
      const domainAttr = !isLocal ? '; domain=.everstake.cx' : '';
      document.cookie = `stakelab_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainAttr}`;
      document.cookie = `sec-admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainAttr}`;
      document.cookie = 'stakelab_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'sec-admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      if (!isAuthPage) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

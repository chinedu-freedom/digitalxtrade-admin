'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiBaseUrl } from '../lib/api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_logged_out', 'true');
      localStorage.removeItem('stakelab_admin');
      localStorage.removeItem('stakelab_admin_token');
      localStorage.removeItem('digital_admin_token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
      try {
        sessionStorage.clear();
      } catch (e) {}

      const isLocal = window.location.hostname.includes('localhost');
      const domainAttr = !isLocal ? '; domain=.everstake.cx' : '';

      const cookiesToClear = [
        'stakelab_admin_token',
        'sec-admin-token',
        'digital_admin_token',
        'admin_token',
        'token'
      ];

      cookiesToClear.forEach((name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainAttr}`;
      });
    }
    setAdmin(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedOut = typeof window !== 'undefined' && localStorage.getItem('admin_logged_out') === 'true';
      if (isLoggedOut) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('stakelab_admin_token') : null;

      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${getApiBaseUrl()}/auth/admin/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.success) {
          const adminData = res.data.admin || res.data.user;
          if (adminData && adminData.role === 'ADMIN') {
            setAdmin(adminData);
            if (typeof window !== 'undefined') {
              localStorage.setItem('stakelab_admin', JSON.stringify(adminData));
            }
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        } else {
          const saved = typeof window !== 'undefined' ? localStorage.getItem('stakelab_admin') : null;
          if (saved) {
            try {
              setAdmin(JSON.parse(saved));
            } catch (e) {
              setAdmin(null);
            }
          } else {
            setAdmin(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (usernameOrEmail, password, remember = false) => {
    try {
      const res = await axios.post(`${getApiBaseUrl()}/auth/admin/login`, {
        username: usernameOrEmail,
        email: usernameOrEmail,
        password,
        remember
      });

      if (res.data && res.data.success) {
        const adminData = res.data.admin || res.data.user;
        setAdmin(adminData);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_logged_out');
          if (res.data.token) {
            localStorage.setItem('stakelab_admin_token', res.data.token);
            const isLocal = window.location.hostname.includes('localhost');
            const maxAge = remember ? 86400 : 3600; // 24 hours if Remember Me is checked, 1 hour if unchecked
            const domainAttr = !isLocal ? '; domain=.everstake.cx' : '';
            document.cookie = `stakelab_admin_token=${res.data.token}; path=/; max-age=${maxAge}; SameSite=Lax${!isLocal ? '; Secure' : ''}`;
            document.cookie = `sec-admin-token=${res.data.token}; path=/; max-age=${maxAge}; SameSite=Lax${!isLocal ? '; Secure' : ''}`;
          }
          localStorage.setItem('stakelab_admin', JSON.stringify(adminData));
        }
        toast.success('Admin login successful!');
        router.push('/admin/dashboard');
        return { success: true };
      } else {
        const msg = res.data?.message || 'Invalid username or password';
        toast.error(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid username or password';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const res = await axios.post(`${getApiBaseUrl()}/auth/forgot-password`, { email });
      toast.success(res.data?.message || 'OTP code sent to admin email!');
      return { success: true, message: res.data?.message };
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to send OTP code';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await axios.post(`${getApiBaseUrl()}/auth/verify-otp`, { email, otp });
      toast.success(res.data?.message || 'OTP verified successfully!');
      return { success: true, message: res.data?.message };
    } catch (e) {
      const msg = e.response?.data?.message || 'Invalid OTP code';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const resetPassword = async (email, password) => {
    try {
      const res = await axios.post(`${getApiBaseUrl()}/auth/reset-password`, { email, password });
      toast.success(res.data?.message || 'Admin password reset successfully!');
      return { success: true, message: res.data?.message };
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to reset password';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        requestPasswordReset,
        verifyOtp,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);



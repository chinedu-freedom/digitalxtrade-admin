'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AdminAuthContext = createContext();

const MOCK_ADMIN = {
  id: 1,
  name: 'Super Admin',
  email: 'admin@stakelab.com',
  username: 'admin',
  role: 'Super Administrator',
  avatar: '/auth-bg.png'
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(MOCK_ADMIN);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('stakelab_admin');
    if (saved) {
      try {
        setAdmin(JSON.parse(saved));
      } catch (e) {
        setAdmin(MOCK_ADMIN);
      }
    } else {
      setAdmin(MOCK_ADMIN);
    }
    setLoading(false);
  }, []);

  const login = async (email, password, remember = false) => {
    setAdmin(MOCK_ADMIN);
    localStorage.setItem('stakelab_admin', JSON.stringify(MOCK_ADMIN));
    toast.success('Admin login successful!');
    router.push('/admin/dashboard');
    return { success: true };
  };

  const requestPasswordReset = async (email) => {
    toast.success('OTP code sent to admin email!');
    return { success: true, message: 'OTP code sent to admin email!' };
  };

  const verifyOtp = async (email, otp) => {
    toast.success('OTP verified successfully!');
    return { success: true, message: 'OTP verified successfully!' };
  };

  const resetPassword = async (email, password) => {
    toast.success('Admin password reset successfully!');
    return { success: true, message: 'Admin password reset successfully!' };
  };

  const logout = () => {
    localStorage.removeItem('stakelab_admin');
    setAdmin(null);
    toast.info('Admin logged out');
    router.push('/admin/login');
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


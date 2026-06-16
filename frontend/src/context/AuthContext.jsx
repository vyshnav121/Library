import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
  });

  // Attach access token to headers
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Intercept 401s to perform silent token refreshing
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !== '/auth/login' &&
        originalRequest.url !== '/auth/refresh'
      ) {
        originalRequest._retry = true;
        try {
          const { data } = await axios.post(
            'http://localhost:5000/api/auth/refresh',
            {},
            { withCredentials: true }
          );
          localStorage.setItem('token', data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('token');
          setUser(null);
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/profile');
          setUser(data);
        } catch (error) {
          console.error('Auth verification failed', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data);
      return { success: true, user: data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      setUser(data);
      return { success: true, user: data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      if (user) {
        setUser((prev) => ({ ...prev, isVerified: true }));
      }
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'OTP verification failed',
      };
    }
  };

  const resendOTP = async (email) => {
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend OTP',
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset request failed',
      };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      const { data } = await api.post('/auth/reset-password', { email, code, newPassword });
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        verifyOTP,
        resendOTP,
        forgotPassword,
        resetPassword,
        loading,
        api,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

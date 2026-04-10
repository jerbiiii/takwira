import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            setUser(decoded);
            // Fetch fresh data from DB immediately to sync state (e.g., plan changes)
            await refreshUser();
          } else {
            localStorage.clear();
          }
        } catch (e) {
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('auth/login/', { email, password });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      const decoded = jwtDecode(res.data.access);
      setUser(decoded);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const res = await api.post('auth/register/', userData);
      if (res.data.access) {
        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        const decoded = jwtDecode(res.data.access);
        setUser(decoded);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data || 'Registration failed' };
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('auth/me/');
      setUser(prev => ({ ...prev, ...res.data }));
      return { success: true };
    } catch (err) {
      console.error("Error refreshing user:", err);
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

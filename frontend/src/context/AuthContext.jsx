import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getRoleDashboard, getRoleOnboarding } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [loading, setLoading] = useState(true);
  const [pendingPhone, setPendingPhone] = useState(null);

  const persistAuth = useCallback((newToken, newUser, newRole) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    }
    if (newUser) {
      setUser(newUser);
    }
    if (newRole) {
      localStorage.setItem('role', newRole);
      setRole(newRole);
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    setRole(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');
      if (storedToken && storedRole) {
        try {
          const endpoint = storedRole === 'WORKER' ? '/workers/me'
            : storedRole === 'CONTRACTOR' ? '/contractors/me'
            : '/companies/me';
          const profile = await api.get(endpoint);
          setUser(profile);
          setRole(storedRole);
        } catch {
          clearAuth();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [clearAuth]);

  const signup = async ({ name, phone, password }) => {
    const data = await api.post('/auth/signup', { name, phone, password });
    setPendingPhone(phone);
    return data;
  };

  const login = async ({ phone, password }) => {
    const data = await api.post('/auth/login', { phone, password });
    setPendingPhone(phone);
    return data;
  };

  const verifyOTP = async (otp) => {
    const data = await api.post('/auth/verify-otp', { phone: pendingPhone, otp });
    persistAuth(data.token, data.user, data.user?.role);
    setPendingPhone(null);
    return data;
  };

  const selectRole = async (selectedRole) => {
    const data = await api.post('/auth/select-role', { role: selectedRole });
    persistAuth(data.token, data.user, selectedRole);
    return data;
  };

  const logout = () => {
    clearAuth();
    setPendingPhone(null);
  };

  const getRedirectPath = () => {
    if (!token || !role) return '/login';
    if (!user?.profileComplete) return getRoleOnboarding(role);
    return getRoleDashboard(role);
  };

  const value = {
    user,
    token,
    role,
    loading,
    pendingPhone,
    signup,
    login,
    verifyOTP,
    selectRole,
    logout,
    persistAuth,
    setUser,
    getRedirectPath,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;

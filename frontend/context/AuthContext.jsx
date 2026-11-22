'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const userData = data.data?.user || data.user;
        setUser({ ...userData, subscription: data.data?.subscription || userData?.subscription });
        // Store user role for redirect logic
        if (userData?.role) {
          localStorage.setItem('userRole', userData.role);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Login failed');
      err.fieldErrors = (data.errors || []).reduce((acc, cur) => {
        acc[cur.field] = cur.message;
        return acc;
      }, {});
      throw err;
    }
    // Store the access token - backend returns 'accessToken' not 'token'
    localStorage.setItem('token', data.data?.accessToken || data.accessToken);
    localStorage.setItem('refreshToken', data.data?.refreshToken || data.refreshToken);
    const userData = data.data?.user || data.user;
    setUser(userData);
    // Store user role for redirect logic
    if (userData?.role) {
      localStorage.setItem('userRole', userData.role);
    }
    // The profile endpoint is the source of truth for persistent fields such as avatar_url.
    await fetchUser();
    return data;
  };

  const register = async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Registration failed');
      err.fieldErrors = (data.errors || []).reduce((acc, cur) => {
        acc[cur.field] = cur.message;
        return acc;
      }, {});
      throw err;
    }
    // Store tokens after registration
    localStorage.setItem('token', data.data?.accessToken || data.accessToken);
    localStorage.setItem('refreshToken', data.data?.refreshToken || data.refreshToken);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

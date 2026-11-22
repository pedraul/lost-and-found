'use client';

import { useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, refreshToken as refreshTokenApi, forgotPassword as forgotPasswordApi, resetPassword as resetPasswordApi } from '../services/auth.api';
import { useAuth } from '../context/AuthContext';

export function useAuthForm() {
  const { login, register, loading: authLoading } = useAuth();
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setError('');
    setFieldErrors({});
  }, []);

  const handleLogin = async (email, password) => {
    setError('');
    setFieldErrors({});
    setIsLoading(true);
    try {
      const response = await login(email, password);
      return response;
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setError('');
    setFieldErrors({});
    setIsLoading(true);
    try {
      await register(userData);
      return true;
    } catch (err) {
      const message = err.message || 'Registration failed';
      setError(message);
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, handleRegister, error, fieldErrors, setError, loading: isLoading || authLoading };
}

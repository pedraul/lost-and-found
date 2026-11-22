'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthForm } from '../../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { handleLogin, error, fieldErrors, loading } = useAuthForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await handleLogin(email, password);
    if (response) {
      // Get user role from response data
      const userRole = response.data?.user?.role || response.user?.role;
      if (userRole === 'admin') {
        router.push('/admin');
      } else if (response.data?.user?.subscription?.paymentOverdue) {
        router.push('/dashboard/payment');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="login-sky relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="login-card relative z-10 w-full max-w-md space-y-8 rounded-[28px] border border-white/10 bg-white p-8 shadow-2xl shadow-orange-500/10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-black text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{' '}
            <Link href="/register" className="font-semibold text-orange-600 hover:text-orange-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600 px-1">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600 px-1">{fieldErrors.password}</p>
              )}
            </div>
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-sm font-semibold text-orange-600 hover:text-orange-500">
              Forgot password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

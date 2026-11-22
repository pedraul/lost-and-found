'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '../../services/auth.api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      setMessage(response.message || 'If that email exists, a reset link has been sent.');
      setResetUrl(response.resetUrl || '');
    } catch (requestError) {
      setError(requestError.message || 'Unable to request a password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-sky relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="login-card relative z-10 w-full max-w-md space-y-8 rounded-[28px] border border-white/10 bg-white p-8 shadow-2xl shadow-orange-500/10">
        <div>
          <h1 className="text-center text-3xl font-black text-slate-900">Forgot password?</h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Enter your email and we will send password reset instructions.
          </p>
        </div>

        {message && (
          <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}
        {resetUrl && <div className="rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"><p className="font-bold">Your password reset link</p><a href={resetUrl} className="mt-2 block break-all font-semibold underline">{resetUrl}</a><p className="mt-2 text-xs">This link expires in 10 minutes.</p></div>}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="relative block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-full border border-transparent bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="text-center text-sm">
          <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-500">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

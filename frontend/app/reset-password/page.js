'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '../../services/auth.api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!token) return setError('This reset link is missing or invalid.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await resetPassword(token, password);
      setMessage('Password reset successfully. You can now sign in.');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) { setError(err.message || 'This reset link is invalid or has expired.'); } finally { setLoading(false); }
  };
  return <main className="login-sky flex min-h-screen items-center justify-center px-4 py-12"><section className="w-full max-w-md rounded-[28px] border border-white/10 bg-white p-6 shadow-2xl sm:p-8"><h1 className="text-center text-3xl font-black text-slate-900">Set a new password</h1><p className="mt-2 text-center text-sm text-slate-600">Choose a strong new password for your account.</p>{message && <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}{error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<form onSubmit={submit} className="mt-6 space-y-4"><input type="password" minLength="8" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="w-full rounded-lg border border-slate-300 px-4 py-3" /><input type="password" minLength="8" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="w-full rounded-lg border border-slate-300 px-4 py-3" /><button disabled={loading} className="w-full rounded-full bg-orange-500 px-4 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50">{loading ? 'Resetting password...' : 'Reset password'}</button></form><Link href="/login" className="mt-6 block text-center text-sm font-semibold text-orange-600">Back to sign in</Link></section></main>;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="login-sky flex min-h-screen items-center justify-center px-4 py-12"><p className="text-white">Loading reset form...</p></main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiRequest } from '../../../services/api';
import { getImageUrl } from '../../../utils/image-url';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, logout, fetchUser } = useAuth();
  const [profile, setProfile] = useState({ full_name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '', avatar_url: user?.avatar_url || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(getImageUrl(user?.avatar_url));

  const updateProfile = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = new FormData();
      payload.append('full_name', profile.full_name);
      payload.append('phone', profile.phone || '');
      payload.append('email', profile.email || '');
      if (avatarFile) payload.append('avatar', avatarFile);
      else if (profile.avatar_url) payload.append('avatar_url', profile.avatar_url);
      await apiRequest('/users/me', { method: 'PATCH', body: payload });
      await fetchUser();
      setAvatarFile(null);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiRequest('/auth/change-password', { method: 'POST', body: JSON.stringify(passwords) });
      setPasswords({ currentPassword: '', newPassword: '' });
      setMessage('Password changed successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Delete your account permanently?')) return;
    try {
      await apiRequest('/users/me', { method: 'DELETE' });
      logout();
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Account</p>
        <h1 className="mt-2 text-4xl font-black text-slate-900">Account settings</h1>
        <p className="mt-2 text-slate-600">Update your profile, password, or account.</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <div><p className="font-bold text-orange-900">Annual item registration</p><p className="mt-1 text-sm text-orange-800">Manage your payment and keep item registration active.</p></div>
          <button type="button" onClick={() => router.push('/dashboard/payment')} className="rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Pay annual fee</button>
        </div>
        {(message || error) && <div className={`mt-6 rounded-lg border p-4 ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{error || message}</div>}
        <div className="mt-8 space-y-6">
          <form onSubmit={updateProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">Account details</h2>
            <p className="mt-1 text-sm text-slate-500">Edit your username, phone number, and profile picture.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-4 sm:col-span-2">
                {avatarPreview ? <img src={avatarPreview} alt="Profile preview" className="h-20 w-20 rounded-full object-cover ring-4 ring-orange-100" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-2xl font-black text-white">{profile.full_name?.charAt(0)?.toUpperCase() || 'U'}</div>}
                <label className="cursor-pointer text-sm font-bold text-orange-600 hover:text-orange-700">
                  Change profile photo
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }} />
                </label>
              </div>
              <label className="text-sm font-semibold text-slate-700">
                Username
                <input className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal" placeholder="Username" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} required />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Phone number
                <input className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal" placeholder="Phone number" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Email address
                <input type="email" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
              </label>
            </div>
            <button className="mt-5 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Save profile</button>
          </form>
          <form onSubmit={changePassword} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">Change password</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input type="password" className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Current password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
              <input type="password" minLength="8" className="rounded-lg border border-slate-300 px-4 py-3" placeholder="New password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
            </div>
            <button className="mt-5 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700">Change password</button>
          </form>
          <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-xl font-black text-red-900">Delete account</h2>
            <p className="mt-2 text-sm text-red-700">This removes your account and signs you out.</p>
            <button type="button" onClick={deleteAccount} className="mt-5 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700">Delete my account</button>
          </section>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Register Item', href: '/dashboard/register-item', icon: '➕' },
  { name: 'My Items', href: '/dashboard/my-items', icon: '📦' },
  { name: 'Matches', href: '/dashboard/matches', icon: '🔗' },
  { name: 'Verify Item', href: '/verify', icon: '✅' },
  { name: 'Search', href: '/search', icon: '🔍' },
  { name: 'Found Items', href: '/found', icon: '🛵' },
  { name: 'Help', href: '/dashboard/help', icon: '❓' },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user?.subscription?.paymentOverdue && pathname !== '/dashboard/payment') {
      router.replace('/dashboard/payment');
    }
  }, [user, loading, pathname, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden items-center gap-3 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-lg shadow-md shadow-orange-500/20">
                  📊
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-black text-slate-900 sm:text-xl">Dashboard</h1>
                <p className="text-xs text-slate-500">Manage your items and recovery requests</p>
              </div>
            </div>

            <div />
          </div>

          <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
            {menuItems.filter((item) => ['Register Item', 'My Items', 'Help'].includes(item.name)).map((item) => (
              <a key={item.href} href={item.href} className="flex items-center gap-2 whitespace-nowrap rounded-t-xl border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-slate-50">
        {children}
      </main>
    </div>
  );
}

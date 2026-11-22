'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/user.api';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lost: 0,
    stolen: 0,
    returned: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getDashboardStats();
        const data = response.data?.stats || response.stats;
        setStats({
          total: data?.totalItems || 0,
          active: data?.activeItems || 0,
          lost: data?.lostItems || 0,
          stolen: data?.stolenItems || 0,
          returned: data?.returnedItems || 0
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const StatCard = ({ icon, label, value, color, bgColor, status }) => (
    <button type="button" onClick={() => router.push(status ? `/dashboard/my-items?status=${status}` : '/dashboard/my-items')} className="w-full text-left bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-orange-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-orange-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
          <p className={`text-4xl font-black ${color}`}>{value}</p>
        </div>
        <div className={`h-14 w-14 rounded-full flex items-center justify-center text-2xl ${bgColor}`}>
          {icon}
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Track and manage your registered items</p>
        </div>

        {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <StatCard
            icon="📦"
            label="Total Items"
            value={loading ? '...' : stats.total}
            color="text-slate-900"
            bgColor="bg-slate-100"
          />
          <StatCard
            icon="✓"
            label="Active Items"
            value={loading ? '...' : stats.active}
            color="text-green-600"
            bgColor="bg-green-100"
            status="active"
          />
          <StatCard
            icon="⚠"
            label="Lost Items"
            value={loading ? '...' : stats.lost}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
            status="lost"
          />
          <StatCard
            icon="🚨"
            label="Stolen Items"
            value={loading ? '...' : stats.stolen}
            color="text-red-600"
            bgColor="bg-red-100"
            status="stolen"
          />
          <StatCard
            icon="✓"
            label="Returned"
            value={loading ? '...' : stats.returned}
            color="text-blue-600"
            bgColor="bg-blue-100"
            status="returned"
          />
        </div>

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-l-4 border-orange-500 p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-200 flex items-center justify-center text-2xl flex-shrink-0">
              👋
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome to Your Dashboard</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Use the navigation tabs above to manage your registered items. You can register new items, 
                change item status (Lost/Stolen/Returned), view matches, and verify ownership claims. 
                Keep your item information updated to ensure successful recovery if needed.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">→</span> Register new items with photos & proof
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">→</span> Update status when items go missing
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">→</span> Verify ownership claims
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">→</span> Track potential matches
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

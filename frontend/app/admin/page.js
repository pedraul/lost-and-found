'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Activity, TrendingUp, BarChart3, Package, CircleDollarSign, SearchCheck, MapPin } from 'lucide-react';
import adminAPI from '../../services/admin.api';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/admin/StatsCard';
import ActivityTable from '../../components/admin/ActivityTable';
import UsersList from '../../components/admin/UsersList';
import MetricsChart from '../../components/admin/MetricsChart';
import ItemsOverview from '../../components/admin/ItemsOverview';
import ReportCenter from '../../components/admin/ReportCenter';
import ActivityLogs from '../../components/admin/ActivityLogs';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [registeredItems, setRegisteredItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [timeRange, setTimeRange] = useState('30');
  const [payments, setPayments] = useState([]);
  const [annualAmount, setAnnualAmount] = useState('1000');
  const [receivingNumber, setReceivingNumber] = useState('');
  const [paymentSettingsMessage, setPaymentSettingsMessage] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [logsCategory, setLogsCategory] = useState('all');
  const [logsScope, setLogsScope] = useState(null);

  // Open the Activity Logs tab on a category, optionally limited to one payment or user.
  const openLogs = (category = 'all', scope = null) => {
    setLogsCategory(category);
    setLogsScope(scope);
    setActiveTab('logs');
  };

  // Check if user is admin
  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch initial data
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
      const refreshInterval = window.setInterval(() => {
        if (document.visibilityState === 'visible') fetchDashboardData();
      }, 30000);
      return () => window.clearInterval(refreshInterval);
    }
  }, [user, timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, metricsData, usersData, itemsData, paymentsData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getSystemMetrics(timeRange),
        adminAPI.getAllUsers(20, 0),
        adminAPI.getItemsOverview(50),
        adminAPI.getPayments(50)
      ]);

      setStats(statsData?.data || statsData || {});
      setMetrics(metricsData?.data || metricsData || {});
      setUsers(usersData?.users || usersData?.data?.users || []);
      setRegisteredItems(itemsData?.registeredItems || itemsData?.data?.registeredItems || []);
      setFoundItems(itemsData?.foundItems || itemsData?.data?.foundItems || []);
      setPayments(paymentsData?.payments || paymentsData?.data?.payments || []);
      setAnnualAmount(String(paymentsData?.annualAmount || paymentsData?.data?.annualAmount || 1000));
      setReceivingNumber(paymentsData?.receivingNumber || paymentsData?.data?.receivingNumber || '');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (selectedUser) => {
    setSelectedUser(selectedUser);
    try {
      const data = await adminAPI.getUserActivity(selectedUser.id);
      setUserActivity(data);
      setActiveTab('userActivity');
    } catch (error) {
      console.error('Error fetching user activity:', error);
    }
  };

  const handleUserStatusChange = async (selectedUser, status) => {
    await adminAPI.updateUserStatus(selectedUser.id, status);
    await fetchDashboardData();
  };

  const handleDeleteUser = async (selectedUser) => {
    setUserToDelete(selectedUser);
  };

  const handlePaymentSettingsSave = async (event) => {
    event.preventDefault();
    setPaymentSettingsMessage(null);

    try {
      const settings = await adminAPI.updatePaymentSettings(annualAmount, receivingNumber);
      setAnnualAmount(String(settings.annualAmount));
      setReceivingNumber(settings.receivingNumber);
      setPaymentSettingsMessage({ type: 'success', text: 'Payment settings saved.' });
      await fetchDashboardData();
    } catch (error) {
      setPaymentSettingsMessage({ type: 'error', text: error.message || 'Unable to save payment settings.' });
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    await adminAPI.deleteUser(userToDelete.id);
    setUserToDelete(null);
    await fetchDashboardData();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You don't have access to this page.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Administration</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Welcome back, {user?.full_name}. Here is your platform overview.</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2 overflow-x-auto border-b border-gray-200 pb-px sm:gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors sm:px-4 sm:text-base ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors sm:px-4 sm:text-base ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors sm:px-4 sm:text-base ${
              activeTab === 'items'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Items
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors sm:px-4 sm:text-base ${
              activeTab === 'reports'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors sm:px-4 sm:text-base ${activeTab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            Payments
          </button>
          <button
            onClick={() => openLogs('all')}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors sm:px-4 sm:text-base ${activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            Activity Logs
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors sm:px-4 sm:text-base ${
              activeTab === 'metrics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Metrics
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                icon={Users}
                label="Total Users"
                value={stats?.totalUsers}
                color="blue"
                onClick={() => setActiveTab('users')}
              />
              <StatsCard
                icon={TrendingUp}
                label="Registered Items"
                value={stats?.totalItems}
                color="green"
                onClick={() => setActiveTab('items')}
              />
              <StatsCard
                icon={Activity}
                label="Found Items"
                value={stats?.totalFoundItems}
                color="orange"
                onClick={() => setActiveTab('items')}
              />
              <StatsCard
                icon={BarChart3}
                label="Successful Matches"
                value={stats?.totalMatches}
                color="purple"
                onClick={() => setActiveTab('reports')}
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCard
                label="Active Users (This Week)"
                value={stats?.activeUsersThisWeek}
                color="blue"
                onClick={() => setActiveTab('metrics')}
              />
              <StatsCard
                label="Verified Users"
                value={stats?.verifiedUsers}
                color="green"
                onClick={() => setActiveTab('users')}
              />
              <StatsCard
                label="Items This Week"
                value={stats?.itemsRegisteredThisWeek}
                color="orange"
                onClick={() => setActiveTab('metrics')}
              />
            </div>

          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">All Users</h2>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            <UsersList users={users} loading={loading} onSelectUser={handleSelectUser} onStatusChange={handleUserStatusChange} onDeleteUser={handleDeleteUser} />

            {selectedUser && userActivity && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedUser.full_name}</h3>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Items Registered</p>
                    <p className="text-2xl font-bold text-gray-900">{userActivity.stats?.registeredItems || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Found Items Reported</p>
                    <p className="text-2xl font-bold text-gray-900">{userActivity.stats?.foundItems || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Verifications Done</p>
                    <p className="text-2xl font-bold text-gray-900">{userActivity.stats?.verifications || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status Changes</p>
                    <p className="text-2xl font-bold text-gray-900">{userActivity.stats?.statusChanges || 0}</p>
                  </div>
                </div>

                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-gray-900">Recent Activities</h4>
                  {userActivity.user?.id && (
                    <button type="button" onClick={() => openLogs('all', { user_id: userActivity.user.id, label: `activity of ${userActivity.user.full_name || userActivity.user.email}` })} className="text-sm font-semibold text-blue-700 hover:underline">
                      Open full activity log →
                    </button>
                  )}
                </div>
                <ActivityTable activities={userActivity.activities} loading={false} />
              </div>
            )}
          </div>
        )}

        {/* ITEMS TAB */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Item Reports</h2>
                <p className="mt-1 text-sm text-gray-500">Monitor registered, lost, stolen, and found items.</p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
            <ItemsOverview registeredItems={registeredItems} foundItems={foundItems} loading={loading} />
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reports</h2>
                <p className="mt-1 text-sm text-gray-500">Review all registered and found-item activity.</p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Registered items</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{registeredItems.length}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Found reports</p>
                <p className="mt-2 text-3xl font-bold text-orange-600">{foundItems.length}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Lost or stolen</p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {registeredItems.filter((item) => ['lost', 'stolen'].includes(item.status)).length}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Matched reports</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {foundItems.filter((item) => item.status === 'matched' || item.matched_item_id).length}
                </p>
              </div>
            </div>

            <ReportCenter users={users} registeredItems={registeredItems} foundItems={foundItems} payments={payments} />

            <ItemsOverview registeredItems={registeredItems} foundItems={foundItems} loading={loading} />
          </div>
        )}

        {/* METRICS TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div><h2 className="text-xl font-bold text-gray-900">Payments</h2><p className="mt-1 text-sm text-gray-500">Review payment attempts and manage annual access.</p></div>
              <button type="button" onClick={() => openLogs('payment')} className="self-start rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 sm:self-auto">View payment logs →</button>
            </div>
            <form onSubmit={handlePaymentSettingsSave} className="flex flex-wrap items-end gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <label className="text-sm font-semibold text-blue-900">Annual fee (RWF)<input type="number" min="100" value={annualAmount} onChange={(event) => setAnnualAmount(event.target.value)} className="mt-1 block rounded-lg border border-blue-200 bg-white px-3 py-2 font-normal text-slate-900" /></label>
              <label className="text-sm font-semibold text-blue-900">Receiving mobile-money number<input type="tel" value={receivingNumber} onChange={(event) => setReceivingNumber(event.target.value)} placeholder="0781234567 or +250781234567" className="mt-1 block rounded-lg border border-blue-200 bg-white px-3 py-2 font-normal text-slate-900" /></label>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Save payment setting</button>
              {paymentSettingsMessage && <p role="status" className={`w-full text-sm font-medium ${paymentSettingsMessage.type === 'error' ? 'text-red-700' : 'text-green-700'}`}>{paymentSettingsMessage.text}</p>}
            </form>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-gray-50"><tr><th className="px-6 py-3">User</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Action</th></tr></thead><tbody className="divide-y divide-gray-100">
                {payments.map((payment) => <tr key={payment.id}><td className="px-6 py-4"><p className="font-semibold">{payment.user?.full_name}</p><p className="text-xs text-gray-500">{payment.user?.email}</p></td><td className="px-6 py-4">{payment.amount} {payment.currency}</td><td className="px-6 py-4 capitalize">{payment.status}</td><td className="px-6 py-4 text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</td><td className="px-6 py-4"><div className="flex flex-wrap gap-2"><button type="button" onClick={async () => { await adminAPI.activateUserSubscription(payment.user_id); await fetchDashboardData(); }} className="rounded bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-200">Activate 1 year</button><button type="button" onClick={() => openLogs('payment', { resource_id: payment.id, label: `payment of ${payment.amount} ${payment.currency} by ${payment.user?.full_name || payment.user?.email || 'user'}` })} className="rounded bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200">History</button></div></td></tr>)}
              </tbody></table></div>
              {payments.length === 0 && <p className="p-6 text-gray-500">No payments recorded.</p>}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <ActivityLogs initialCategory={logsCategory} scope={logsScope} onClearScope={() => setLogsScope(null)} />
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-2xl font-black text-gray-900">Platform analytics</h2><p className="mt-1 text-sm text-gray-500">Live database metrics for the selected period.</p></div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {[
                [Users, 'Users', metrics?.totals?.users, 'text-blue-700 bg-blue-50'],
                [Package, 'Registered', metrics?.totals?.registered_items, 'text-emerald-700 bg-emerald-50'],
                [MapPin, 'Found reports', metrics?.totals?.found_items, 'text-orange-700 bg-orange-50'],
                [TrendingUp, 'Matches', metrics?.totals?.matches, 'text-purple-700 bg-purple-50'],
                [SearchCheck, 'Paid records', metrics?.totals?.successful_payments, 'text-cyan-700 bg-cyan-50'],
                [CircleDollarSign, 'Revenue (RWF)', Number(metrics?.totals?.payment_revenue || 0).toLocaleString(), 'text-rose-700 bg-rose-50'],
              ].map(([Icon, label, value, style]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`inline-flex rounded-xl p-2 ${style}`}><Icon size={19} /></div><p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value ?? 0}</p></div>)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {metrics?.itemsOverTime && (
                <MetricsChart
                  data={metrics.itemsOverTime}
                  title="Items Registered Over Time"
                  type="pie"
                />
              )}
              {metrics?.matchesOverTime && (
                <MetricsChart
                  data={metrics.matchesOverTime}
                  title="Matches Created Over Time"
                  type="pie"
                />
              )}
              {metrics?.foundItemsOverTime && (
                <MetricsChart data={metrics.foundItemsOverTime} title="Found-item reports over time" type="pie" />
              )}
              {metrics?.usersOverTime && (
                <MetricsChart data={metrics.usersOverTime} title="New users over time" type="pie" />
              )}
              {metrics?.verificationsOverTime && (
                <MetricsChart
                  data={metrics.verificationsOverTime}
                  title="Verifications Over Time"
                  type="pie"
                />
              )}
              {metrics?.paymentsOverTime && (
                <MetricsChart data={metrics.paymentsOverTime} title="Payment attempts over time" type="pie" />
              )}
              {metrics?.topDevices && (
                <MetricsChart
                  data={metrics.topDevices}
                  title="Top Devices by Registration Count"
                  type="pie"
                />
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <MetricsChart data={metrics?.itemStatusDistribution} title="Item status breakdown" type="pie" />
              <MetricsChart data={metrics?.foundStatusDistribution} title="Found-report status" type="pie" />
              <MetricsChart data={metrics?.paymentStatusDistribution} title="Payment status" type="pie" />
            </div>

            {metrics?.roleDistribution && <MetricsChart data={metrics.roleDistribution.map((item) => ({ ...item, label: item.role }))} title="User role distribution" type="pie" />}
          </div>
        )}
      </main>

      {userToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4"
          role="presentation"
          onClick={() => setUserToDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-user-title" className="text-xl font-bold text-slate-900">
              Delete user?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This will permanently delete <strong>{userToDelete.full_name}</strong> and their account data. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete user
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { apiRequest } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const toQuery = (filters) => new URLSearchParams(
  Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== 'all')
).toString();

const adminAPI = {
  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await apiRequest('/admin/dashboard/stats');
    return response.data;
  },

  // Recent Activities
  getRecentActivities: async (limit = 50, offset = 0) => {
    const response = await apiRequest(`/admin/dashboard/activities?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getItemsOverview: async (limit = 50) => {
    const response = await apiRequest(`/admin/items?limit=${limit}`);
    return response.data;
  },

  getReportData: async (source) => {
    const response = await apiRequest(`/admin/reports?source=${encodeURIComponent(source)}`);
    return response.data;
  },

  // System Metrics
  getSystemMetrics: async (timeRange = '30') => {
    const response = await apiRequest(`/admin/dashboard/metrics?timeRange=${timeRange}`);
    return response.data;
  },

  // All Users
  getAllUsers: async (limit = 20, offset = 0, role = null) => {
    const params = { limit, offset };
    if (role) params.role = role;
    const query = new URLSearchParams(params);
    const response = await apiRequest(`/admin/users?${query}`);
    return response.data;
  },

  getPayments: async (limit = 50) => {
    const response = await apiRequest(`/admin/payments?limit=${limit}`);
    return response.data;
  },

  updatePaymentSettings: async (annualAmount, receivingNumber) => {
    const response = await apiRequest('/admin/payments/settings', { method: 'PATCH', body: JSON.stringify({ annual_amount_rwf: annualAmount, receiving_number: receivingNumber }) });
    return response.data;
  },

  activateUserSubscription: async (userId) => {
    const response = await apiRequest(`/admin/users/${userId}/subscription`, { method: 'POST' });
    return response.data;
  },

  updateUserStatus: async (userId, accountStatus) => {
    const response = await apiRequest(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ account_status: accountStatus }),
    });
    return response.data;
  },

  deleteUser: async (userId) => apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }),

  // Activity / audit logs (payments, accounts, items, admin actions, security)
  getLogs: async (filters = {}) => {
    const response = await apiRequest(`/admin/logs?${toQuery(filters)}`);
    return response.data;
  },

  getLogActions: async () => {
    const response = await apiRequest('/admin/logs/actions');
    return response.data;
  },

  // Downloads the filtered logs as CSV (needs the auth header, so no plain link).
  exportLogs: async (filters = {}) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/admin/logs/export?${toQuery(filters)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Could not export the activity logs.');
    const blob = await res.blob();
    const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '')?.[1] || 'activity-logs.csv';
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return { truncated: res.headers.get('x-export-truncated') === 'true' };
  },

  // User Activity
  getUserActivity: async (userId, limit = 30, offset = 0) => {
    const response = await apiRequest(`/admin/users/${userId}/activity?limit=${limit}&offset=${offset}`);
    return response.data;
  }
};

export default adminAPI;

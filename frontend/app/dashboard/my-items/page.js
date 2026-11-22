'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useItems } from '../../../hooks/useItems';
import { updateItem } from '../../../services/items.api';

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: '✓' },
  lost: { label: 'Lost', color: 'bg-yellow-100 text-yellow-800', icon: '⚠' },
  stolen: { label: 'Stolen', color: 'bg-red-100 text-red-800', icon: '🚨' },
  returned: { label: 'Returned', color: 'bg-blue-100 text-blue-800', icon: '✓' },
  transferred: { label: 'Transferred', color: 'bg-purple-100 text-purple-800', icon: '→' },
  deleted: { label: 'Deleted', color: 'bg-gray-100 text-gray-800', icon: '✕' }
};

export default function MyItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, loading, error, fetchItems, removeItem } = useItems();
  const [updating, setUpdating] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchItems(searchParams.get('status') ? { status: searchParams.get('status') } : {});
  }, [searchParams]);
  const statusFilter = searchParams.get('status');

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      setUpdating(itemId);
      await updateItem(itemId, { status: newStatus });
      setSuccessMessage(`Item status updated to ${STATUS_CONFIG[newStatus].label}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchItems();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (itemId) => {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        setUpdating(itemId);
        await removeItem(itemId);
        setSuccessMessage('Item deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        await fetchItems();
      } catch (err) {
        alert('Failed to delete item: ' + err.message);
      } finally {
        setUpdating(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900">{statusFilter ? `${STATUS_CONFIG[statusFilter]?.label || statusFilter} Items` : 'My Registered Items'}</h1>
            <p className="text-slate-600 mt-2">{statusFilter ? `Showing only ${STATUS_CONFIG[statusFilter]?.label?.toLowerCase() || statusFilter} items.` : 'Manage and track the status of your registered items'}</p>
            {statusFilter && <button type="button" onClick={() => router.push('/dashboard/my-items')} className="mt-3 text-sm font-bold text-orange-600 hover:text-orange-700">Show all items</button>}
          </div>
          <button
            onClick={() => router.push('/dashboard/register-item')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            <span>➕</span> Register New Item
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <p className="text-green-800 font-medium">✓ {successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-300 border-t-orange-600"></div>
              </div>
              <p className="text-slate-600">Loading your items...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mb-6">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Items Registered Yet</h3>
            <p className="text-slate-600 mb-6">Start by registering your first item to protect it.</p>
            <button
              onClick={() => router.push('/dashboard/register-item')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
            >
              <span>➕</span> Register Your First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all p-6">
                {/* Item Header */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{item.item_name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{item.model}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${STATUS_CONFIG[item.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                    <span>{STATUS_CONFIG[item.status]?.icon}</span>
                    {STATUS_CONFIG[item.status]?.label || item.status}
                  </div>
                </div>

                {/* Item Details */}
                <div className="space-y-2 text-sm text-slate-600 mb-6 pb-6 border-b border-slate-100">
                  {item.serial_number && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">🔢</span>
                      <span><strong>Serial:</strong> {item.serial_number}</span>
                    </div>
                  )}
                  {item.imei_number && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">📱</span>
                      <span><strong>IMEI:</strong> {item.imei_number}</span>
                    </div>
                  )}
                  {item.vin_number && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">🚗</span>
                      <span><strong>VIN:</strong> {item.vin_number}</span>
                    </div>
                  )}
                </div>

                {/* Status Selector */}
                <div className="space-y-3 mb-4">
                  <label className="block text-sm font-semibold text-slate-700">Change Status</label>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    disabled={updating === item.id}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <option value="active">✓ Active</option>
                    <option value="lost">⚠ Lost</option>
                    <option value="stolen">🚨 Stolen</option>
                    <option value="returned">✓ Returned</option>
                    <option value="transferred">→ Transferred</option>
                    <option value="deleted">✕ Deleted</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/items/${item.id}`)}
                    disabled={updating === item.id}
                    className="flex-1 text-sm bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={updating === item.id}
                    className="flex-1 text-sm bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

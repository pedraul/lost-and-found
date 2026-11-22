import React from 'react';
import { format } from 'date-fns';

export default function ActivityTable({ activities, loading = false }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getActionBadgeColor = (actionType) => {
    const colors = {
      'item_registered': 'bg-blue-100 text-blue-800',
      'item_found': 'bg-green-100 text-green-800',
      'match_created': 'bg-purple-100 text-purple-800',
      'verification_done': 'bg-yellow-100 text-yellow-800',
      'status_changed': 'bg-orange-100 text-orange-800',
      'item_claimed': 'bg-indigo-100 text-indigo-800'
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="responsive-table w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">User</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Resource</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Description</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Time</th>
            </tr>
          </thead>
          <tbody>
            {activities && activities.length > 0 ? (
              activities.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td data-label="User" className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      {activity.user?.avatar_url && (
                        <img
                          src={activity.user.avatar_url}
                          alt={activity.user.full_name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{activity.actor_name || activity.user?.full_name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{activity.actor_email || activity.user?.email || activity.actor_role || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td data-label="Action" className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(activity.action_type)}`}>
                      {String(activity.action_type || '').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td data-label="Resource" className="px-6 py-3">
                    <span className="text-gray-600 capitalize">{activity.resource_type}</span>
                  </td>
                  <td data-label="Description" className="px-6 py-3 text-gray-600 max-w-xs truncate">
                    {activity.description || '-'}
                  </td>
                  <td data-label="Time" className="px-6 py-3 text-gray-500 whitespace-nowrap">
                    {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No activities found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

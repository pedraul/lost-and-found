import React from 'react';

export default function UsersList({ users, loading = false, onSelectUser = null, onStatusChange = null, onDeleteUser = null }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      enterprise: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="responsive-table w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">User</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Role</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Items Registered</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Found Items</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Trust Score</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectUser && onSelectUser(user)}
                >
                  <td data-label="User" className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      {user.avatar_url && (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                    </div>
                  </td>
                  <td data-label="Email" className="px-6 py-3 text-gray-600">{user.email}</td>
                  <td data-label="Role" className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Status" className="px-6 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${user.account_status === 'active' ? 'bg-green-100 text-green-800' : user.account_status === 'suspended' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-700'}`}>
                        {user.account_status || 'active'}
                      </span>
                      <span className="text-xs text-gray-500">{user.is_verified ? 'Verified' : 'Unverified'}</span>
                    </div>
                  </td>
                  <td data-label="Registered items" className="px-6 py-3">
                    <span className="font-medium text-gray-900">{user.registeredItemsCount || 0}</span>
                  </td>
                  <td data-label="Found items" className="px-6 py-3">
                    <span className="font-medium text-gray-900">{user.foundItemsCount || 0}</span>
                  </td>
                  <td data-label="Trust score" className="px-6 py-3">
                    <span className="font-medium text-gray-900">{user.trust_score || 100}</span>
                  </td>
                  <td data-label="Actions" className="px-6 py-3" onClick={(event) => event.stopPropagation()}>
                    <div className="flex flex-wrap gap-2">
                      {user.account_status !== 'active' && <button type="button" onClick={() => onStatusChange?.(user, 'active')} className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Activate</button>}
                      {user.account_status === 'active' && <button type="button" onClick={() => onStatusChange?.(user, 'suspended')} className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">Suspend</button>}
                      {user.account_status !== 'deactivated' && <button type="button" onClick={() => onStatusChange?.(user, 'deactivated')} className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">Deactivate</button>}
                      <button type="button" onClick={() => onDeleteUser?.(user)} className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

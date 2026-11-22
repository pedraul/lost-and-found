'use client';

const registeredStatusStyles = {
  active: 'bg-green-100 text-green-800',
  lost: 'bg-yellow-100 text-yellow-800',
  stolen: 'bg-red-100 text-red-800',
  returned: 'bg-blue-100 text-blue-800',
  transferred: 'bg-purple-100 text-purple-800'
};

const foundStatusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  matched: 'bg-blue-100 text-blue-800',
  claimed: 'bg-purple-100 text-purple-800',
  returned: 'bg-green-100 text-green-800',
  resolved: 'bg-slate-200 text-slate-700',
  expired: 'bg-red-100 text-red-800'
};

function StatusBadge({ status, styles }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status || 'unknown'}
    </span>
  );
}

export default function ItemsOverview({ registeredItems = [], foundItems = [], loading }) {
  if (loading) {
    return <p className="rounded-lg bg-white p-8 text-center text-gray-500">Loading item reports...</p>;
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Registered Items</h3>
          <p className="mt-1 text-sm text-gray-500">Owner items and their current status.</p>
        </div>
        {registeredItems.length === 0 ? (
          <p className="p-6 text-gray-500">No registered items found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="responsive-table min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registeredItems.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Item" className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                      {item.item_name}<span className="ml-2 text-gray-500">{item.model}</span>
                    </td>
                    <td data-label="Owner" className="px-6 py-4 text-gray-600">
                      <div>{item.owner?.full_name || 'Unknown user'}</div>
                      <div className="text-xs text-gray-400">{item.owner?.email}</div>
                    </td>
                    <td data-label="Status" className="px-6 py-4"><StatusBadge status={item.status} styles={registeredStatusStyles} /></td>
                    <td data-label="Registered" className="whitespace-nowrap px-6 py-4 text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Found Item Reports</h3>
          <p className="mt-1 text-sm text-gray-500">Items reported by users as found.</p>
        </div>
        {foundItems.length === 0 ? (
          <p className="p-6 text-gray-500">No found-item reports found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="responsive-table min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Reporter</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {foundItems.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Item" className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                      {item.item_name}<span className="ml-2 text-gray-500">{item.item_category}</span>
                    </td>
                    <td data-label="Reporter" className="px-6 py-4 text-gray-600">
                      <div>{item.reporter?.full_name || item.reporter_name || 'Unknown user'}</div>
                      <div className="text-xs text-gray-400">{item.reporter?.email || item.reporter_email}</div>
                    </td>
                    <td data-label="Location" className="max-w-xs truncate px-6 py-4 text-gray-600">{item.found_location}</td>
                    <td data-label="Status" className="px-6 py-4"><StatusBadge status={item.status} styles={foundStatusStyles} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

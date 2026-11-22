export default function StatusBadge({ status }) {
  const styles = {
    active: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
    stolen: 'bg-orange-100 text-orange-800',
    returned: 'bg-blue-100 text-blue-800',
    deleted: 'bg-gray-100 text-gray-800',
    transferred: 'bg-purple-100 text-purple-800',
    pending: 'bg-yellow-100 text-yellow-800',
    matched: 'bg-blue-100 text-blue-800',
    claimed: 'bg-green-100 text-green-800',
    resolved: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
  };

  const style = styles[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${style}`}>
      {status}
    </span>
  );
}

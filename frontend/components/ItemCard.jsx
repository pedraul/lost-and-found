'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';

export default function ItemCard({ item }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{item.item_name}</h3>
          <p className="text-sm text-gray-500">{item.model}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="space-y-1 text-sm text-gray-600 mb-4">
        {item.serial_number && <p>Serial: {item.serial_number}</p>}
        {item.imei_number && <p>IMEI: {item.imei_number}</p>}
        {item.vin_number && <p>VIN: {item.vin_number}</p>}
        {item.item_category && <p>Category: {item.item_category}</p>}
      </div>
      <Link
        href={`/items/${item.id}`}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        View Details →
      </Link>
    </div>
  );
}

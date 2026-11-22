import React from 'react';
import { format } from 'date-fns';

export default function StatsCard({ icon: Icon, label, value, color = 'blue', trend = null, onClick }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  const iconBgClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`${colorClasses[color]} w-full rounded-lg border p-6 text-left shadow-sm transition-all ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">{label}</h3>
        {Icon && (
          <div className={`${iconBgClasses[color]} p-2 rounded-lg`}>
            <Icon size={24} />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold">{value || 0}</p>
      {trend && (
        <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
        </p>
      )}
    </button>
  );
}

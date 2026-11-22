import React from 'react';
import { format } from 'date-fns';

export default function MetricsChart({ data, title, type = 'line' }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-80 flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Simple text-based chart representation
  const maxValue = Math.max(...data.map(d => d.count));
  const scale = 100 / maxValue;

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + Number(item.count || 0), 0);
    const colors = ['#2563eb', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4', '#eab308', '#ec4899'];
    let cursor = 0;
    const segments = data.map((item, index) => {
      const portion = total ? (Number(item.count) / total) * 100 : 0;
      const segment = { ...item, portion, color: colors[index % colors.length], start: cursor };
      cursor += portion;
      return segment;
    });
    const gradient = segments.map((segment) => `${segment.color} ${segment.start}% ${segment.start + segment.portion}%`).join(', ');

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative h-44 w-44 shrink-0 rounded-full" style={{ background: `conic-gradient(${gradient || '#e2e8f0 0 100%'})` }}>
            <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white text-center"><span className="text-2xl font-black text-slate-900">{total}</span><span className="text-xs font-semibold text-slate-500">total</span></div>
          </div>
          <div className="w-full space-y-3">{segments.map((segment, index) => <div key={index} className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2 text-slate-600"><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />{segment.date || segment.model_name || segment.label || segment.role}</span><span className="whitespace-nowrap font-bold text-slate-900">{segment.count} <span className="text-xs font-normal text-slate-500">({Math.round(segment.portion)}%)</span></span></div>)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">{item.date || item.model_name}</span>
              <span className="text-sm font-medium text-gray-900">{item.count}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(item.count * scale, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

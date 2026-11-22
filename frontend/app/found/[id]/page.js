'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getFoundItemById } from '../../../services/matches.api';

export default function FoundItemDetailsPage({ params }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadItem = async () => {
      try {
        const data = await getFoundItemById(params.id);
        setItem(data.data?.foundItem || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 px-4 py-16 text-center text-gray-500">Loading found item...</div>;
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Found item unavailable</h1>
        <p className="mt-2 text-gray-500">{error || 'This found item could not be found.'}</p>
        <Link href="/found" className="mt-6 inline-flex rounded-full bg-[#f46b4f] px-6 py-3 text-sm font-bold text-white">Back to found items</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/found" className="text-sm font-bold text-[#f46b4f]">← Back to found items</Link>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {item.overall_image_url && (
            <img src={item.overall_image_url} alt={item.item_name} className="h-72 w-full object-cover sm:h-96" />
          )}
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f46b4f]">Found in Rwanda</p>
                <h1 className="mt-2 text-3xl font-black text-[#10233f]">{item.item_name}</h1>
                <p className="mt-1 text-sm text-slate-500">{item.item_category}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold capitalize text-blue-800">{item.status}</span>
            </div>
            <p className="mt-6 leading-7 text-slate-600">{item.item_description || 'No additional description was provided.'}</p>
            <dl className="mt-8 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Found location</dt><dd className="mt-1 font-semibold text-slate-700">{item.found_location}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">District</dt><dd className="mt-1 font-semibold text-slate-700">{item.found_district || 'Not provided'}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Sector</dt><dd className="mt-1 font-semibold text-slate-700">{item.found_sector || 'Not provided'}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Found date</dt><dd className="mt-1 font-semibold text-slate-700">{item.found_date}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Finder phone</dt><dd className="mt-1 font-semibold text-slate-700">{item.reporter_phone || 'Not provided'}</dd></div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-full bg-[#f46b4f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d9533d]">Log in to claim</Link>
              <Link href="/search" className="rounded-full border border-[#10233f] px-6 py-3 text-sm font-bold text-[#10233f] transition hover:bg-[#10233f] hover:text-white">Search your item</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

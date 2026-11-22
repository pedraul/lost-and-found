'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getFoundItems } from '../../../services/matches.api';
import { getDeviceTypes } from '../../../services/items.api';
import { getImageUrl } from '../../../utils/image-url';
import { electronicsTypesFromCatalog } from '../../../utils/electronics-catalog';

function formatLocation(item) {
  return [item.found_city, item.found_district, item.found_sector, item.found_country]
    .filter(Boolean)
    .join(', ') || item.found_location || 'Location not provided';
}

export default function FoundItemCategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.category || '');
  const [items, setItems] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [selectedItemType, setSelectedItemType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const [foundResponse, typesResponse] = await Promise.all([
          getFoundItems({ category: categoryName, limit: 50 }),
          getDeviceTypes(),
        ]);
        setItems(foundResponse.data?.items || []);
        setDeviceTypes(typesResponse.data?.deviceTypes || []);
      } catch (err) {
        setError(err.message || 'Unable to load this category.');
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) loadCategory();
  }, [categoryName]);

  const category = deviceTypes.find((type) => type.category?.name === categoryName)?.category;
  const categoryTypes = categoryName === 'electronics'
    ? electronicsTypesFromCatalog(deviceTypes)
    : deviceTypes.filter((type) => type.category?.name === categoryName);
  const itemTypeStats = useMemo(() => items.reduce((stats, item) => {
    stats[item.item_name] = (stats[item.item_name] || 0) + 1;
    return stats;
  }, categoryTypes
    .reduce((stats, type) => ({ ...stats, [type.display_name]: 0 }), {})), [categoryName, deviceTypes, items]);
  const visibleItems = selectedItemType ? items.filter((item) => item.item_name === selectedItemType) : items;
  const categoryLabel = category?.display_name || categoryName;

  return (
    <main className="min-h-screen bg-[#f8f9f7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/found-items" className="inline-flex text-sm font-bold text-[#f46b4f] hover:text-[#d9533d]">← Back to categories</Link>
        <div className="mb-10 mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f46b4f]">Found-item statistics</p>
          <h1 className="mt-2 text-4xl font-black text-[#10233f]">{categoryLabel}</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Choose an item type to see its found-item reports.</p>
        </div>

        {loading && <p className="py-16 text-center text-slate-500">Loading item-type statistics...</p>}
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p>}
        {!loading && !error && <>
          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f46b4f]">Item types</p><h2 className="mt-2 text-2xl font-black text-[#10233f]">Items in {categoryLabel}</h2></div><button type="button" onClick={() => setSelectedItemType('')} className={`rounded-full px-4 py-2 text-sm font-bold ${!selectedItemType ? 'bg-[#10233f] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>All items · {items.length}</button></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(itemTypeStats).map(([itemType, total]) => <button key={itemType} type="button" onClick={() => setSelectedItemType(itemType)} className={`rounded-xl border-2 p-5 text-left transition-all ${selectedItemType === itemType ? 'border-[#f46b4f] bg-orange-50 shadow-md' : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:shadow-sm'}`}><p className="text-lg font-black text-[#10233f]">{itemType}</p><p className="mt-2 text-4xl font-black text-[#10233f]">{total}</p><p className="mt-2 text-sm font-semibold text-[#f46b4f]">{total ? `View ${total === 1 ? 'item' : 'items'} ↓` : 'No items reported yet'}</p></button>)}</div>
          </section>

          <section><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-black text-[#10233f]">{selectedItemType || `All ${categoryLabel} items`}</h2><p className="mt-1 text-sm text-slate-600">{visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'} listed</p></div>{selectedItemType && <button type="button" onClick={() => setSelectedItemType('')} className="text-sm font-bold text-[#f46b4f] hover:text-[#d9533d]">Show all items</button>}</div>
            {visibleItems.length === 0 ? <p className="rounded-xl bg-white p-10 text-center text-slate-500">No found items match this selection yet.</p> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{visibleItems.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{item.photo_url || item.overall_image_url ? <img src={getImageUrl(item.photo_url || item.overall_image_url)} alt={`${item.item_name} photo`} className="h-56 w-full bg-slate-100 object-contain" /> : <div className="flex h-56 items-center justify-center bg-slate-100 text-6xl">🔎</div>}<div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#f46b4f]">{categoryLabel}</p><h3 className="mt-1 text-xl font-black text-[#10233f]">{item.item_name}</h3><p className="text-sm text-slate-500">{item.brand || item.model || 'Details available on the report'}</p></div><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold capitalize text-blue-700">{item.status}</span></div><dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600"><div><dt className="font-semibold text-slate-700">Found location</dt><dd>{formatLocation(item)}</dd></div>{item.item_description && <div><dt className="font-semibold text-slate-700">Description</dt><dd>{item.item_description}</dd></div>}</dl><Link href={`/found/${item.id}`} className="mt-5 inline-flex text-sm font-bold text-[#f46b4f] hover:text-[#d9533d]">View full report</Link></div></article>)}</div>}
          </section>
        </>}
      </div>
    </main>
  );
}

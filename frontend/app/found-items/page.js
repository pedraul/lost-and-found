'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getFoundItems } from '../../services/matches.api';
import { getDeviceTypes } from '../../services/items.api';
import { getImageUrl } from '../../utils/image-url';

function formatLocation(item) {
  return [item.found_city, item.found_district, item.found_sector, item.found_country]
    .filter(Boolean)
    .join(', ') || item.found_location || 'Location not provided';
}

export default function FoundItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItemType, setSelectedItemType] = useState('');

  const platformCategories = deviceTypes.reduce((result, deviceType) => {
    if (deviceType.category && !result.some((category) => category.id === deviceType.category.id)) result.push(deviceType.category);
    return result;
  }, []);
  const categoryStats = items.reduce((stats, item) => {
    const category = item.item_category || 'other';
    stats[category] = (stats[category] || 0) + 1;
    return stats;
  }, platformCategories.reduce((stats, category) => ({ ...stats, [category.name]: 0 }), {}));
  const categories = Object.entries(categoryStats).sort(([left], [right]) => left.localeCompare(right));
  const selectedCategoryTypes = deviceTypes.filter((type) => type.category?.name === selectedCategory);
  const selectedCategoryItems = items.filter((item) => item.item_category === selectedCategory);
  const itemTypeStats = selectedCategoryItems.reduce((stats, item) => {
    stats[item.item_name] = (stats[item.item_name] || 0) + 1;
    return stats;
  }, selectedCategoryTypes.reduce((stats, type) => ({ ...stats, [type.display_name]: 0 }), {}));
  const visibleItems = items.filter((item) => (!selectedCategory || item.item_category === selectedCategory) && (!selectedItemType || item.item_name === selectedItemType));

  const showCategory = (category) => {
    if (!category) {
      setSelectedCategory('');
      setSelectedItemType('');
      return;
    }

    router.push(`/found-items/${encodeURIComponent(category)}`);
  };

  const showItemType = (itemType) => {
    setSelectedItemType(itemType);
    document.getElementById('found-report-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await getFoundItems({ limit: 50 });
        setItems(response.data?.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
    getDeviceTypes().then((response) => setDeviceTypes(response.data?.deviceTypes || [])).catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f9f7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f46b4f]">Community recovery board</p>
            <h1 className="mt-2 text-4xl font-black text-[#10233f]">Found items</h1>
            <p className="mt-3 max-w-2xl text-slate-600">See items reported by people who found them and review the location and identifying details.</p>
          </div>
          <Link href="/found" className="rounded-full bg-[#f46b4f] px-5 py-3 text-sm font-bold text-white hover:bg-[#d9533d]">Report a found item</Link>
        </div>
        {loading && <p className="py-16 text-center text-slate-500">Loading found items...</p>}
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p>}
        {!loading && !error && <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f46b4f]">Found-item statistics</p><h2 className="mt-2 text-2xl font-black text-[#10233f]">Items by category</h2><p className="mt-2 text-sm text-slate-600">Select a category to browse its reports below.</p></div><button type="button" onClick={() => showCategory('')} className={`rounded-full px-4 py-2 text-sm font-bold ${!selectedCategory ? 'bg-[#10233f] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>All items · {items.length}</button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map(([category, total]) => <button key={category} type="button" onClick={() => showCategory(category)} className={`rounded-xl border-2 p-5 text-left transition-all ${selectedCategory === category ? 'border-[#f46b4f] bg-orange-50 shadow-md' : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:shadow-sm'}`}><p className="text-sm font-bold uppercase tracking-wide text-slate-500">{platformCategories.find((entry) => entry.name === category)?.display_name || category}</p><p className="mt-2 text-4xl font-black text-[#10233f]">{total}</p><p className="mt-2 text-sm font-semibold text-[#f46b4f]">{total ? `View ${total === 1 ? 'item' : 'items'} ↓` : 'No items reported yet'}</p></button>)}</div></section>}
        {!loading && !error && selectedCategory && <section id="found-item-types" className="mb-10 scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f46b4f]">Step 2: Item type</p><h2 className="mt-2 text-2xl font-black text-[#10233f]">Choose an item type</h2><p className="mt-2 text-sm text-slate-600">Select the exact type within {platformCategories.find((entry) => entry.name === selectedCategory)?.display_name || selectedCategory}.</p></div><button type="button" onClick={() => { setSelectedCategory(''); setSelectedItemType(''); }} className="text-sm font-bold text-[#f46b4f] hover:text-[#d9533d]">Back to categories</button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(itemTypeStats).map(([itemType, total]) => <button key={itemType} type="button" onClick={() => showItemType(itemType)} className={`rounded-xl border-2 p-5 text-left transition-all ${selectedItemType === itemType ? 'border-[#f46b4f] bg-orange-50 shadow-md' : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:shadow-sm'}`}><p className="text-lg font-black text-[#10233f]">{itemType}</p><p className="mt-2 text-4xl font-black text-[#10233f]">{total}</p><p className="mt-2 text-sm font-semibold text-[#f46b4f]">{total ? `View ${total === 1 ? 'item' : 'items'} ↓` : 'No items reported yet'}</p></button>)}</div></section>}
        {!loading && !error && items.length === 0 && <p className="rounded-xl bg-white p-10 text-center text-slate-500">No found items have been reported yet.</p>}
        {!loading && !error && items.length > 0 && (
          <section id="found-report-list" className="scroll-mt-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-black text-[#10233f]">{selectedItemType || platformCategories.find((entry) => entry.name === selectedCategory)?.display_name || selectedCategory || 'All found items'}</h2><p className="mt-1 text-sm text-slate-600">{visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'} listed</p></div>{(selectedCategory || selectedItemType) && <button type="button" onClick={() => { setSelectedCategory(''); setSelectedItemType(''); }} className="text-sm font-bold text-[#f46b4f] hover:text-[#d9533d]">Show all items</button>}</div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {item.photo_url || item.overall_image_url ? <img src={getImageUrl(item.photo_url || item.overall_image_url)} alt={`${item.item_name} photo`} className="h-56 w-full bg-slate-100 object-contain" /> : <div className="flex h-56 items-center justify-center bg-slate-100 text-6xl">🔎</div>}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#f46b4f]">{item.item_category || 'Found item'}</p><h2 className="mt-1 text-xl font-black text-[#10233f]">{item.item_name}</h2><p className="text-sm text-slate-500">{item.brand || item.model || 'Details available on the report'}</p></div><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold capitalize text-blue-700">{item.status}</span></div>
                  <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600"><div><dt className="font-semibold text-slate-700">Found location</dt><dd>{formatLocation(item)}</dd></div>{item.item_description && <div><dt className="font-semibold text-slate-700">Description</dt><dd>{item.item_description}</dd></div>}</dl>
                  <Link href={`/found/${item.id}`} className="mt-5 inline-flex text-sm font-bold text-[#f46b4f] hover:text-[#d9533d]">View full report</Link>
                </div>
              </article>
            ))}
          </div></section>
        )}
      </div>
    </main>
  );
}

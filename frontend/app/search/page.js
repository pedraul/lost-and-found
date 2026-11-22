'use client';

import { useState } from 'react';
import { searchByIdentifier, searchFoundItems } from '../../services/search.api';
import { getImageUrl } from '../../utils/image-url';

export default function SearchPage() {
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState('serial_number');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('registered');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);
    try {
      if (searchType === 'registered') {
        const data = await searchByIdentifier(identifier, identifierType);
        setResults(data.data);
      } else {
        const data = await searchFoundItems(identifier);
        setResults(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07172d] px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: "url('/kigali-convention-centre.jpg')" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,23,45,0.62),rgba(7,23,45,0.9))]" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl">
        <div className="mb-8 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffb09e]">Secure item lookup</p>
          <h1 className="mt-2 text-4xl font-black">Search Items</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-200">Search an exact serial number, IMEI, VIN, or verification code to view the available item status and recovery details.</p>
        </div>
        <div className="rounded-2xl border border-white/40 bg-white/[0.97] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setSearchType('registered')}
              className={`px-4 py-2 rounded-md ${searchType === 'registered' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Registered Items
            </button>
            <button
              onClick={() => setSearchType('found')}
              className={`px-4 py-2 rounded-md ${searchType === 'found' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Found Items
            </button>
          </div>
          <form onSubmit={handleSearch} className="space-y-6">
            {searchType === 'registered' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Identifier Type</label>
                <select
                  value={identifierType}
                  onChange={(e) => setIdentifierType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="serial_number">Serial Number</option>
                  <option value="imei_number">IMEI Number</option>
                  <option value="vin_number">VIN Number</option>
                  <option value="id_number">ID Number</option>
                  <option value="passport_number">Passport Number</option>
                  <option value="license_plate">License Plate</option>
                  <option value="verification_code">Verification Code</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {searchType === 'registered' ? 'Identifier' : 'Verification Code'}
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder={searchType === 'registered' ? 'Enter serial number, IMEI, etc.' : 'Enter verification code'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {results && (
            <div className="mt-8">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Search results</p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900">Matching items</h3>
                </div>
                <span className="text-sm text-slate-500">
                  {(results.registeredItems?.length || 0) + (results.items?.length || 0)} found
                </span>
              </div>
              {results.registeredItems?.length === 0 && results.items?.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                  <p className="font-semibold text-slate-700">No matching items found</p>
                  <p className="mt-1 text-sm text-slate-500">Check the identifier and try again.</p>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {results.registeredItems?.map((item, index) => (
                    <article key={`${item.item_name}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
                      {item.photo_url ? (
                        <img src={getImageUrl(item.photo_url)} alt={`${item.item_name} photo`} className="h-56 w-full bg-slate-100 object-contain" />
                      ) : (
                        <div className="flex h-56 items-center justify-center bg-slate-100 text-5xl">📦</div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Registered item</p>
                            <h4 className="mt-1 text-lg font-black text-slate-900">{item.item_name}</h4>
                            <p className="text-sm text-slate-500">{item.model}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                            item.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            item.status === 'lost' ? 'bg-red-100 text-red-700' :
                            item.status === 'stolen' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      {item.owner && (
                        <div className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
                          <p><strong className="text-slate-800">Owner:</strong> {item.owner.name}</p>
                          {item.owner.phone && <p className="mt-1"><strong className="text-slate-800">Contact:</strong> {item.owner.phone}</p>}
                        </div>
                      )}
                      {item.location && (
                        <p className="mt-3 text-sm text-slate-600">
                          <strong className="text-slate-800">Location:</strong>{' '}
                          {[item.location.sector, item.location.district, item.location.province, item.location.country]
                            .filter(Boolean)
                            .join(', ') || 'Not provided'}
                        </p>
                      )}
                      </div>
                    </article>
                  ))}
                  {results.items?.map((item) => (
                    <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
                      {item.overall_image_url ? (
                        <img src={getImageUrl(item.overall_image_url)} alt={`${item.item_name} photo`} className="h-56 w-full bg-slate-100 object-contain" />
                      ) : (
                        <div className="flex h-56 items-center justify-center bg-slate-100 text-5xl">🔎</div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Found item</p>
                            <h4 className="mt-1 text-lg font-black text-slate-900">{item.item_name}</h4>
                            <p className="text-sm text-slate-500">{item.item_category}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                            item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            item.status === 'matched' ? 'bg-blue-100 text-blue-700' :
                            item.status === 'claimed' || item.status === 'returned' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

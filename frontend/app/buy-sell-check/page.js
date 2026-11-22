'use client';

import { useState } from 'react';
import Link from 'next/link';
import { searchByIdentifier } from '../../services/search.api';

export default function BuySellCheckPage() {
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState('serial_number');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await searchByIdentifier(identifier, identifierType);
      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Buy / Sell Check</h1>
        <p className="text-gray-600 text-center mb-8">
          Verify if an item is reported lost or stolen before buying or selling
        </p>
        <div className="bg-white p-8 rounded-lg shadow">
          <form onSubmit={handleCheck} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Check by</label>
              <select
                value={identifierType}
                onChange={(e) => setIdentifierType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="serial_number">Serial Number</option>
                <option value="imei_number">IMEI Number</option>
                <option value="vin_number">VIN Number</option>
                <option value="license_plate">License Plate</option>
                <option value="verification_code">Verification Code</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Enter Value</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter serial number, IMEI, VIN, etc."
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
              {loading ? 'Checking...' : 'Check Item'}
            </button>
          </form>
          {result && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Check Results</h3>
              {result.registeredItems?.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-800 font-medium">This item is not reported as lost or stolen.</p>
                  <p className="text-sm text-green-600 mt-1">You can proceed with confidence.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {result.registeredItems?.map((item) => (
                    <div key={item.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.item_name}</h4>
                          <p className="text-sm text-gray-600">{item.model}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'lost' ? 'bg-red-100 text-red-800' :
                          item.status === 'stolen' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-red-600 mt-2 font-medium">
                        Warning: This item is reported as {item.status}!
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need more details?{' '}
            <Link href="/search" className="text-blue-600 hover:text-blue-800">
              Search all items
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { getMyMatches, updateMatchStatus } from '../../../services/matches.api';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await getMyMatches();
      setMatches(data.data?.matches || data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (matchId, status) => {
    try {
      await updateMatchStatus(matchId, status);
      fetchMatches();
    } catch (err) {
      alert('Failed to update match: ' + err.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Matches</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {loading ? (
          <p className="text-gray-500">Loading matches...</p>
        ) : matches.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">No matches found yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {match.foundItem?.item_name || 'Unknown Item'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Matched with: {match.registeredItem?.item_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Confidence: {match.confidence_score}%
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    match.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    match.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {match.status}
                  </span>
                </div>
                {match.status === 'pending' && (
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(match.id, 'confirmed')}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(match.id, 'rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
  );
}

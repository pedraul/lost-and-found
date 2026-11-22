'use client';

export default function VerificationResult({ result, error }) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className={`border rounded-md p-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
      <h3 className={`text-lg font-medium ${result.success ? 'text-green-800' : 'text-yellow-800'} mb-2`}>
        {result.success ? 'Verification Successful' : 'Verification Failed'}
      </h3>
      {result.item && (
        <div className="text-sm text-gray-700">
          <p><span className="font-medium">Item:</span> {result.item.item_name}</p>
          <p><span className="font-medium">Status:</span> {result.item.status}</p>
          {result.item.verified_at && (
            <p><span className="font-medium">Verified at:</span> {new Date(result.item.verified_at).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
}

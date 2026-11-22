import { compressFormData } from '../utils/compress-image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Uploads: shrink photos so the request stays under the host's body-size limit.
  const body = options.body instanceof FormData ? await compressFormData(options.body) : options.body;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    body,
    headers,
    // Dashboards, item lists, and metrics must always reflect current database data.
    cache: options.cache || 'no-store',
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : { message: (await res.text()) || 'Request failed' };

  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong');
    err.status = res.status;
    err.fieldErrors = (data.errors || []).reduce((acc, cur) => {
      acc[cur.field] = cur.message;
      return acc;
    }, {});
    throw err;
  }

  return data;
}

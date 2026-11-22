import { apiRequest } from './api';

export async function getMyMatches(query = {}) {
  const params = new URLSearchParams(query);
  return apiRequest(`/matches?${params.toString()}`);
}

export async function updateMatchStatus(matchId, status) {
  return apiRequest(`/matches/${matchId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getFoundItems(query = {}) {
  const params = new URLSearchParams(query);
  return apiRequest(`/found-items?${params.toString()}`);
}

export async function getFoundItemById(id) {
  return apiRequest(`/found-items/${id}`);
}

export async function reportFoundItem(data) {
  return apiRequest('/found-items', {
    method: 'POST',
    body: data,
  });
}

export async function claimFoundItem(id, data) {
  return apiRequest(`/found-items/${id}/claim`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

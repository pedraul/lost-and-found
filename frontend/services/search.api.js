import { apiRequest } from './api';

export async function searchByIdentifier(identifier, identifierType) {
  const params = new URLSearchParams({ identifier, identifier_type: identifierType });
  return apiRequest(`/search?${params.toString()}`);
}

export async function searchFoundItems(verificationCode) {
  const params = new URLSearchParams({ verification_code: verificationCode });
  return apiRequest(`/search/found-items?${params.toString()}`);
}

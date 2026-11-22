import { apiRequest } from './api';

export async function createVerification(itemId, data) {
  return apiRequest(`/verifications/${itemId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyWithCode(verificationCode, itemId) {
  return apiRequest('/verifications/verify-code', {
    method: 'POST',
    body: JSON.stringify({ verification_code: verificationCode, item_id: itemId }),
  });
}

export async function getVerificationStatus(itemId) {
  return apiRequest(`/verifications/${itemId}`);
}

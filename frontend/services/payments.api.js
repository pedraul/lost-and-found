import { apiRequest } from './api';

export async function createPaymentCheckout(phoneNumber, durationMonths) {
  return apiRequest('/payments/checkout', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phoneNumber, duration_months: durationMonths })
  });
}

export async function getPaymentStatus() {
  return apiRequest('/payments/status');
}

export async function completeMockPayment(durationMonths) {
  return apiRequest('/payments/mock/complete', {
    method: 'POST',
    body: JSON.stringify({ duration_months: durationMonths })
  });
}


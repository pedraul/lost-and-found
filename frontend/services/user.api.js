import { apiRequest } from './api';

export async function getDashboardStats() {
  return apiRequest('/users/dashboard');
}
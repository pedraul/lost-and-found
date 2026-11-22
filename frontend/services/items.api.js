import { apiRequest } from './api';

export async function getMyItems(query = {}) {
  const params = new URLSearchParams(query);
  return apiRequest(`/items${params.toString() ? `?${params.toString()}` : ''}`);
}

export async function getLostItems(query = {}) {
  const params = new URLSearchParams(query);
  return apiRequest(`/lost-items?${params.toString()}`);
}

export async function getItemById(id) {
  return apiRequest(`/items/${id}`);
}

export async function registerItem(itemData) {
  return apiRequest('/items', {
    method: 'POST',
    body: itemData,
  });
}

export async function updateItem(id, itemData) {
  return apiRequest(`/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(itemData),
  });
}

export async function deleteItem(id) {
  return apiRequest(`/items/${id}`, {
    method: 'DELETE',
  });
}

export async function getDeviceTypes() {
  return apiRequest('/items/device-types');
}

export async function getManufacturersByDeviceType(deviceTypeId) {
  return apiRequest(`/items/device-types/${deviceTypeId}/manufacturers`);
}

export const VEHICLE_DEVICE_TYPES = [
  { name: 'car', displayName: 'Car', icon: '🚗', photoCount: 2 },
  { name: 'motorcycle', displayName: 'Motorcycle', icon: '🏍️', photoCount: 2 },
  { name: 'bicycle', displayName: 'Bicycle', icon: '🚲', photoCount: 2 },
  { name: 'truck', displayName: 'Truck', icon: '🚚', photoCount: 2 },
  { name: 'van', displayName: 'Van', icon: '🚐', photoCount: 2 }
];

export function vehicleTypesFromCatalog(deviceTypes) {
  return VEHICLE_DEVICE_TYPES.map((definition) => {
    const deviceType = deviceTypes.find((type) => type.name === definition.name);
    return deviceType ? { ...deviceType, ...definition } : null;
  }).filter(Boolean);
}

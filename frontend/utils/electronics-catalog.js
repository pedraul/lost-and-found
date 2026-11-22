export const ELECTRONICS_DEVICE_TYPES = [
  { name: 'phone', displayName: 'Phone', icon: '📱', photoCount: 2 },
  { name: 'laptop', displayName: 'Laptop', icon: '💻', photoCount: 2 },
  { name: 'tablet', displayName: 'Tablet', icon: '📱', photoCount: 2 },
  { name: 'camera', displayName: 'Camera', icon: '📷', photoCount: 2 },
  { name: 'tv', displayName: 'TV', icon: '📺', photoCount: 2 },
  { name: 'printer', displayName: 'Printer', icon: '🖨️', photoCount: 2 },
  { name: 'router', displayName: 'Router', icon: '📡', photoCount: 2 },
  { name: 'hard_drive', displayName: 'Hard Drive', icon: '💾', photoCount: 2 },
  { name: 'projector', displayName: 'Projector', icon: '📽️', photoCount: 2 },
  { name: 'solar_box', displayName: 'Solar Box', icon: '☀️', photoCount: 2 }
];

export const electronicsTypeByName = Object.fromEntries(
  ELECTRONICS_DEVICE_TYPES.map((deviceType) => [deviceType.name, deviceType])
);

export function electronicsTypesFromCatalog(deviceTypes) {
  return ELECTRONICS_DEVICE_TYPES.map((definition) => {
    const deviceType = deviceTypes.find((type) => type.name === definition.name);
    return deviceType ? { ...deviceType, ...definition } : null;
  }).filter(Boolean);
}

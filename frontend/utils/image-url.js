export function getImageUrl(url) {
  if (!url) return '';
  const uploadIndex = url.indexOf('/uploads/');
  return uploadIndex >= 0 ? url.slice(uploadIndex) : url;
}
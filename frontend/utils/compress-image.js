// Shrinks phone photos before upload. Vercel rejects request bodies over
// 4.5 MB, and one item registration can carry two full-size photos (often
// 3–8 MB each). Photos are resized to at most 1800 px on the long side and
// re-encoded as JPEG, which keeps serial numbers readable at a few hundred KB.

const MAX_SIDE = 1800;
const QUALITY = 0.82;
const SKIP_BELOW_BYTES = 600 * 1024;
const COMPRESSIBLE = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode failed')); };
  img.src = url;
});

export async function compressImage(file) {
  if (typeof window === 'undefined' || !(file instanceof File)) return file;
  if (!COMPRESSIBLE.has(file.type) || file.size < SKIP_BELOW_BYTES) return file;
  try {
    const img = await loadImage(file); // HEIC only decodes in Safari; others keep the original
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; // transparent PNG areas become white, not black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified });
  } catch (error) {
    return file;
  }
}

/** Returns a copy of the FormData with every image compressed. */
export async function compressFormData(formData) {
  const entries = [...formData.entries()];
  if (!entries.some(([, value]) => value instanceof File)) return formData;
  const result = new FormData();
  for (const [key, value] of entries) {
    if (value instanceof File) {
      const file = await compressImage(value);
      result.append(key, file, file.name);
    } else {
      result.append(key, value);
    }
  }
  return result;
}

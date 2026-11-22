'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getItemById } from '../../../services/items.api';
import { getImageUrl } from '../../../utils/image-url';

const date = (value) => value ? new Date(value).toLocaleDateString() : null;
const fieldLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

function DetailsSection({ title, values }) {
  const entries = Object.entries(values).filter(([, value]) => value !== null && value !== undefined && value !== '');
  if (!entries.length) return null;
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-slate-900">{title}</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2">{entries.map(([key, value]) => <div key={key} className="min-w-0"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{fieldLabel(key)}</dt><dd className="mt-1 break-words font-medium text-slate-800">{value}</dd></div>)}</dl></section>;
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getItemById(params.id)
      .then((response) => setItem(response.data?.item || response.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <main className="min-h-screen p-8 text-center text-slate-500">Loading item details...</main>;
  if (error) return <main className="min-h-screen p-8 text-center text-red-600">{error}</main>;
  if (!item) return <main className="min-h-screen p-8 text-center text-slate-500">Item not found.</main>;

  const photos = [
    ['Receipt / proof of purchase', item.receipt_image_url, item.receipt_file_name],
    ['Item photo', item.front_image_url, item.front_file_name],
    ['Back of item', item.back_image_url, item.back_file_name],
    ['Serial / identifier photo', item.serial_image_url, item.serial_file_name],
    ['Screen photo', item.screen_image_url, item.screen_file_name],
    ['Side photo', item.side_image_url, item.side_file_name],
    ['Interior photo', item.interior_image_url, item.interior_file_name],
    ['Cargo photo', item.cargo_image_url, item.cargo_file_name],
    ['Drivetrain photo', item.drivetrain_image_url, item.drivetrain_file_name],
    ['Frame photo', item.frame_image_url, item.frame_file_name],
    ['Full bicycle photo', item.full_bike_image_url, item.full_bike_file_name],
    ['ID front photo', item.id_front_image_url, item.id_front_file_name],
    ['ID back photo', item.id_back_image_url, item.id_back_file_name],
    ['Passport photo', item.passport_photo_image_url, item.passport_photo_file_name],
    ['Passport ID photo', item.passport_id_image_url, item.passport_id_file_name],
  ].filter(([, url]) => url);

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12"><div className="mx-auto max-w-5xl"><button type="button" onClick={() => router.back()} className="mb-6 text-sm font-bold text-orange-600 hover:text-orange-700">← Back to my items</button><header className="rounded-2xl bg-[#10233f] p-6 text-white shadow-lg sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wide text-orange-200">{item.deviceType?.category?.display_name || 'Registered item'}</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{item.item_name}</h1><p className="mt-1 text-slate-300">{item.model}</p></div><span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold capitalize">{item.status}</span></div></header><div className="mt-6 space-y-6"><DetailsSection title="Item information" values={{ item_name: item.item_name, device_type: item.deviceType?.display_name, manufacturer: item.manufacturer?.display_name || item.manufacturer?.name, model: item.model, year: item.year, status: item.status, is_verified: item.is_verified ? 'Yes' : 'No', trust_score: item.trust_score, registered_on: date(item.created_at) }} /><DetailsSection title="Identifiers" values={{ serial_number: item.serial_number, imei_number: item.imei_number, vin_number: item.vin_number, license_plate: item.license_plate, frame_size: item.frame_size, id_number: item.id_number, passport_number: item.passport_number, verification_code: item.verification_code }} /><DetailsSection title="Owner and document information" values={{ full_name: item.full_name, date_of_birth: item.date_of_birth, issuing_country: item.issuing_country, expiry_date: item.expiry_date }} /><DetailsSection title="Purchase and location information" values={{ cost: item.cost ? `${item.currency || ''} ${item.cost}` : null, purchase_date: item.purchase_date, purchase_store_name: item.purchase_store_name, country: item.country, city: item.city, province: item.province, district: item.district, sector: item.sector, phone_number: item.phone_number }} />{item.notes && <DetailsSection title="Additional notes" values={{ notes: item.notes }} />}{photos.length > 0 && <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-slate-900">Registration photos</h2><p className="mt-1 text-sm text-slate-500">Photos submitted with this item registration.</p><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{photos.map(([label, url, filename]) => <a key={label} href={getImageUrl(url)} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:border-orange-300 hover:shadow-md"><img src={getImageUrl(url)} alt={label} className="h-52 w-full object-contain" /><div className="border-t border-slate-200 bg-white p-3"><p className="font-bold text-slate-800">{label}</p>{filename && <p className="mt-1 truncate text-xs text-slate-500">{filename}</p>}</div></a>)}</div></section>}</div></div></main>;
}

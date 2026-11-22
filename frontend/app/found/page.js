'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { getFoundItems, reportFoundItem } from '../../services/matches.api';
import { getDeviceTypes } from '../../services/items.api';

const today = () => new Date().toISOString().slice(0, 10);

const IDENTIFIER_FIELDS = {
  serial_number: { label: 'Serial number', placeholder: 'Enter the serial number' },
  imei_number: { label: 'IMEI number', placeholder: 'Enter the 15-digit IMEI' },
  vin_number: { label: 'VIN', placeholder: 'Enter the 17-character VIN' },
  license_plate: { label: 'Licence plate', placeholder: 'Enter the licence plate' },
  passport_number: { label: 'Passport number', placeholder: 'Enter the passport number' },
  id_number: { label: 'ID number', placeholder: 'Enter the ID number' },
  frame_size: { label: 'Frame size', placeholder: 'Enter the bicycle frame size' }
};

const MODEL_OPTIONS_BY_ITEM_TYPE = {
  Smartphone: ['iPhone', 'Samsung Galaxy', 'Google Pixel', 'Huawei', 'Tecno', 'Infinix', 'Nokia', 'Other smartphone'],
  Laptop: ['MacBook', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Other laptop'],
  Tablet: ['iPad', 'Samsung Galaxy Tab', 'Huawei MatePad', 'Lenovo Tab', 'Other tablet'],
  Camera: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'GoPro', 'Other camera'],
};

export default function FoundItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFoundCategory, setSelectedFoundCategory] = useState('');
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    item_category: '',
    item_name: '',
    serial_number: '',
    imei_number: '',
    vin_number: '',
    license_plate: '',
    passport_number: '',
    id_number: '',
    frame_size: '',
    model: '',
    item_description: '',
    found_location: '',
    found_date: today(),
    found_city: 'Kigali',
    found_district: '',
    found_sector: '',
    found_country: 'Rwanda',
  });
  const [photos, setPhotos] = useState({ overall_image: null, serial_image: null });

  const categories = deviceTypes.reduce((result, deviceType) => {
    const category = deviceType.category;
    if (!category) return result;
    if (!result.some((entry) => entry.id === category.id)) result.push(category);
    return result;
  }, []);
  const availableItemTypes = deviceTypes.filter((deviceType) => deviceType.category?.name === formData.item_category);
  const selectedDeviceType = availableItemTypes.find((deviceType) => deviceType.display_name === formData.item_name);
  const identifierFields = (selectedDeviceType?.required_fields || []).filter((field) => IDENTIFIER_FIELDS[field] && field !== 'imei_number');
  const foundCategoryStats = items.reduce((stats, item) => {
    const category = item.item_category || 'other';
    stats[category] = (stats[category] || 0) + 1;
    return stats;
  }, categories.reduce((stats, category) => ({ ...stats, [category.name]: 0 }), {}));
  const foundCategories = Object.entries(foundCategoryStats).sort(([left], [right]) => left.localeCompare(right));
  const visibleFoundItems = selectedFoundCategory
    ? items.filter((item) => item.item_category === selectedFoundCategory)
    : items;

  const showFoundCategory = (category) => {
    setSelectedFoundCategory(category);
    document.getElementById('found-item-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const deviceTypeLabel = (deviceType) => deviceType.name === 'smartphone'
    ? 'Phone (Smartphone)'
    : deviceType.display_name;
  const modelOptions = MODEL_OPTIONS_BY_ITEM_TYPE[formData.item_name] || ['Standard model', 'Other'];

  const selectCategory = (category) => {
    setFormData((current) => ({ ...current, item_category: category.name, item_name: '' }));
    setCurrentStep(2);
  };

  const selectItemType = (deviceType) => {
    setFormData((current) => ({ ...current, item_name: deviceType.display_name, serial_number: '', imei_number: '', vin_number: '', license_plate: '', passport_number: '', id_number: '', frame_size: '', model: '' }));
    setCurrentStep(3);
  };

  const returnToCategories = () => {
    setFormData((current) => ({ ...current, item_category: '', item_name: '' }));
    setCurrentStep(1);
  };

  const returnToItemTypes = () => {
    setFormData((current) => ({ ...current, item_name: '' }));
    setCurrentStep(2);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'item_category') {
      setFormData((current) => ({ ...current, item_category: value, item_name: '' }));
      return;
    }
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    setPhotos((current) => ({ ...current, [event.target.name]: event.target.files?.[0] || null }));
  };

  const handleReport = async (event) => {
    event.preventDefault();
    setReportError('');
    setReportSuccess('');
    setSubmitting(true);
    try {
      if (!photos.overall_image || !photos.serial_image) {
        throw new Error('Please upload an overall photo and an identifier photo.');
      }
      const report = new FormData();
      Object.entries(formData).forEach(([name, value]) => report.append(name, value));
      report.append('overall_image', photos.overall_image);
      report.append('serial_image', photos.serial_image);
      const response = await reportFoundItem(report);
      setReportSuccess(`Report submitted. Keep this verification code: ${response.verification_code}`);
      setFormData({
        reporter_name: '', reporter_email: '', reporter_phone: '',
        item_category: '', item_name: '', serial_number: '', imei_number: '', vin_number: '', license_plate: '', passport_number: '', id_number: '', frame_size: '', model: '', item_description: '', found_location: '',
        found_date: today(),
        found_city: 'Kigali', found_district: '', found_sector: '', found_country: 'Rwanda',
      });
      setCurrentStep(1);
      setPhotos({ overall_image: null, serial_image: null });
      const refreshed = await getFoundItems();
      setItems(refreshed.data?.items || []);
    } catch (err) {
      setReportError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (user?.phone) {
      setFormData((current) => current.reporter_phone ? current : { ...current, reporter_phone: user.phone });
    }
  }, [user]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getFoundItems();
        setItems(data.data?.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await getDeviceTypes();
        setDeviceTypes(data.data?.deviceTypes || []);
      } catch (err) {
        setCatalogError('The item catalog could not be loaded. Please refresh and try again.');
      } finally {
        setCatalogLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07172d] px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: "url('/kigali-convention-centre.jpg')" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,23,45,0.62),rgba(7,23,45,0.9))]" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffb09e]">Kigali community board</p>
          <h1 className="mt-2 text-4xl font-black">Found Items</h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-200">Report a found belonging clearly and help its owner identify where it was recovered.</p>
        </div>
        <section className="mb-10 rounded-2xl border border-white/40 bg-white/[0.97] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f46b4f]">Help return a belonging</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Report a found item</h2>
            <p className="mt-2 text-slate-600">{currentStep === 1 ? 'Step 1: Choose the category of the item you found.' : currentStep === 2 ? 'Step 2: Select the specific item type.' : 'Complete the report details and upload clear photos.'}</p>
          </div>

          {catalogLoading ? <p className="py-8 text-center text-slate-500">Loading item categories...</p> : catalogError ? <p className="rounded-lg bg-red-50 p-4 text-red-700">{catalogError}</p> : <>
            {currentStep === 1 && <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="text-2xl font-black text-slate-900">Step 1: Select a Category</h3>
              <p className="mb-8 mt-2 text-slate-600">Choose the category that best describes what you found.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {categories.map((category) => <button key={category.id} type="button" onClick={() => selectCategory(category)} className="group min-w-0 rounded-lg border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 text-left transition-all hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20 sm:p-6">
                  <div className="mb-3 text-4xl transition-transform group-hover:scale-110">{category.icon || '📦'}</div>
                  <h4 className="text-lg font-black text-slate-900 transition-colors group-hover:text-orange-600">{category.display_name}</h4>
                  <p className="mt-2 text-sm text-slate-600">{deviceTypes.filter((type) => type.category?.id === category.id).length} item types</p>
                </button>)}
              </div>
            </div>}

            {currentStep === 2 && <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <button type="button" onClick={returnToCategories} className="mb-4 flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700">← Back to Categories</button>
              <h3 className="text-2xl font-black text-slate-900">Step 2: Select an Item Name</h3>
              <p className="mb-8 mt-2 text-slate-600">Choose the specific item name within {categories.find((category) => category.name === formData.item_category)?.display_name}. For electronics, choose Phone (Smartphone) when applicable.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {availableItemTypes.map((deviceType) => <button key={deviceType.id} type="button" onClick={() => selectItemType(deviceType)} className="group min-w-0 rounded-lg border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 text-left transition-all hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20 sm:p-6">
                  <div className="mb-3 text-4xl transition-transform group-hover:scale-110">{deviceType.icon || '📦'}</div>
                  <h4 className="text-lg font-black text-slate-900 transition-colors group-hover:text-orange-600">{deviceTypeLabel(deviceType)}</h4>
                  <p className="mt-2 text-sm text-slate-600">{deviceType.description || 'Report this item type'}</p>
                </button>)}
              </div>
            </div>}

            {currentStep === 3 && <form onSubmit={handleReport} className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="grid gap-4 border-b border-slate-200 pb-8 md:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">Category<select className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal" value={formData.item_category} onChange={(event) => { const category = categories.find((entry) => entry.name === event.target.value); if (category) selectCategory(category); }}><option value="" disabled>Select a category</option>{categories.map((category) => <option key={category.id} value={category.name}>{category.display_name}</option>)}</select></label>
                <label className="text-sm font-semibold text-slate-700">Item name<select className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal" value={selectedDeviceType?.id || ''} onChange={(event) => { const deviceType = availableItemTypes.find((type) => type.id === event.target.value); if (deviceType) selectItemType(deviceType); }}><option value="" disabled>Select an item name</option>{availableItemTypes.map((deviceType) => <option key={deviceType.id} value={deviceType.id}>{deviceTypeLabel(deviceType)}</option>)}</select></label>
                {selectedDeviceType?.required_fields?.includes('model') && <label className="text-sm font-semibold text-slate-700">Model<select className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal" value={formData.model} onChange={handleChange} name="model" required><option value="" disabled>Select a model</option>{modelOptions.map((model) => <option key={model} value={model}>{model}</option>)}</select></label>}
                {selectedDeviceType?.required_fields?.includes('imei_number') && <label className="text-sm font-semibold text-slate-700">IMEI number (optional)<input className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal" name="imei_number" placeholder={IDENTIFIER_FIELDS.imei_number.placeholder} value={formData.imei_number} onChange={handleChange} /></label>}
              </div>
              <div>
                <button type="button" onClick={returnToItemTypes} className="mb-4 flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700">← Back to Item Types</button>
                <span className="inline-block rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">{categories.find((category) => category.name === formData.item_category)?.icon} {categories.find((category) => category.name === formData.item_category)?.display_name} - {formData.item_name}</span>
              </div>
              <div className="border-b border-slate-200 pb-8"><h3 className="mb-4 text-xl font-black text-slate-900">Your Contact Details</h3><div className="grid gap-4 md:grid-cols-2">{!user && <><input className="rounded-lg border border-slate-300 px-4 py-3" name="reporter_name" required placeholder="Your name" value={formData.reporter_name} onChange={handleChange} /><input className="rounded-lg border border-slate-300 px-4 py-3" name="reporter_email" type="email" placeholder="Your email" value={formData.reporter_email} onChange={handleChange} /></>}<input className="rounded-lg border border-slate-300 px-4 py-3" name="reporter_phone" type="tel" required placeholder="Your phone number" value={formData.reporter_phone} onChange={handleChange} /></div><p className="mt-3 text-xs text-slate-500">This phone number will be visible to users viewing the found-item report.</p></div>
              <div className="border-b border-slate-200 pb-8"><h3 className="mb-4 text-xl font-black text-slate-900">Found Item Details</h3><div className="grid gap-4 md:grid-cols-2">{identifierFields.map((field) => <input key={field} className="rounded-lg border border-slate-300 px-4 py-3" name={field} required placeholder={IDENTIFIER_FIELDS[field].placeholder} value={formData[field]} onChange={handleChange} />)}{selectedDeviceType?.required_fields?.includes('model') && <input className="rounded-lg border border-slate-300 px-4 py-3" name="model" required placeholder="Model" value={formData.model} onChange={handleChange} />}<input className="rounded-lg border border-slate-300 px-4 py-3" name="found_location" required placeholder="Where was it found?" value={formData.found_location} onChange={handleChange} /><label className="text-sm font-semibold text-slate-700">Date found<input name="found_date" required type="date" max={today()} value={formData.found_date} onChange={handleChange} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal" /></label><input className="self-end rounded-lg border border-slate-300 px-4 py-3" name="found_city" placeholder="City" value={formData.found_city} onChange={handleChange} /><input className="rounded-lg border border-slate-300 px-4 py-3" name="found_district" placeholder="District" value={formData.found_district} onChange={handleChange} /><input className="rounded-lg border border-slate-300 px-4 py-3" name="found_sector" placeholder="Sector" value={formData.found_sector} onChange={handleChange} /><input className="rounded-lg border border-slate-300 px-4 py-3" name="found_country" placeholder="Country" value={formData.found_country} onChange={handleChange} /></div></div>
              <div className="border-b border-slate-200 pb-8"><h3 className="mb-2 text-xl font-black text-slate-900">Upload Photos</h3><p className="mb-4 text-sm text-slate-600">Clear photos make a match more likely.</p><div className="grid gap-6 md:grid-cols-2">{[['overall_image', 'Overall item photo'], ['serial_image', 'Identifier or serial photo']].map(([name, label]) => <label key={name} className="flex cursor-pointer flex-col gap-3 rounded-lg border-2 border-dashed border-slate-300 p-6 text-sm transition hover:border-orange-300"><span className="font-semibold text-slate-700">{label} *</span><input name={name} required type="file" accept="image/*" onChange={handlePhotoChange} />{photos[name] && <span className="text-xs font-medium text-green-700">✓ {photos[name].name}</span>}</label>)}</div></div>
              <div><h3 className="mb-4 text-xl font-black text-slate-900">Additional Description</h3><textarea name="item_description" placeholder="Describe the item and any distinctive marks" value={formData.item_description} onChange={handleChange} className="min-h-28 w-full rounded-lg border border-slate-300 px-4 py-3" rows="4" /></div>
              {reportError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{reportError}</p>}
              {reportSuccess && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{reportSuccess}</p>}
              <button type="submit" disabled={submitting} className="rounded-full bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50">{submitting ? 'Submitting report...' : 'Submit found-item report'}</button>
            </form>}
          </>}
        </section>
        {false && <>
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        {loading ? (
          <p className="text-center text-white">Loading found items...</p>
        ) : items.length === 0 ? (
          <><section className="mb-8 rounded-2xl border border-white/40 bg-white p-6 shadow-xl sm:p-8"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f46b4f]">Found-item statistics</p><h2 className="mt-2 text-2xl font-black text-[#10233f]">Items by category</h2><p className="mt-2 text-sm text-slate-600">These platform categories will update as people report found items.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{foundCategories.map(([category, total]) => <button key={category} type="button" onClick={() => showFoundCategory(category)} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-5 text-left"><p className="text-sm font-bold uppercase tracking-wide text-slate-500">{categories.find((entry) => entry.name === category)?.display_name || category}</p><p className="mt-2 text-4xl font-black text-[#10233f]">{total}</p><p className="mt-2 text-sm font-semibold text-[#f46b4f]">No items reported yet</p></button>)}</div></section><div className="rounded-lg bg-white p-8 text-center shadow"><p className="text-gray-500">No found items reported yet.</p></div></>
        ) : (<>
          <section className="mb-8 rounded-2xl border border-white/40 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f46b4f]">Found-item statistics</p><h2 className="mt-2 text-2xl font-black text-[#10233f]">Items by category</h2><p className="mt-2 text-sm text-slate-600">Select a category to view its found-item reports below.</p></div><button type="button" onClick={() => showFoundCategory('')} className={`rounded-full px-4 py-2 text-sm font-bold ${!selectedFoundCategory ? 'bg-[#10233f] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>All items · {items.length}</button></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{foundCategories.map(([category, total]) => <button key={category} type="button" onClick={() => showFoundCategory(category)} className={`rounded-xl border-2 p-5 text-left transition-all ${selectedFoundCategory === category ? 'border-[#f46b4f] bg-orange-50 shadow-md' : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:shadow-sm'}`}><p className="text-sm font-bold uppercase tracking-wide text-slate-500">{category}</p><p className="mt-2 text-4xl font-black text-[#10233f]">{total}</p><p className="mt-2 text-sm font-semibold text-[#f46b4f]">View {total === 1 ? 'item' : 'items'} ↓</p></button>)}</div>
          </section>
          <section id="found-item-list" className="scroll-mt-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-black text-white">{selectedFoundCategory || 'All found items'}</h2><p className="mt-1 text-sm text-slate-200">{visibleFoundItems.length} {visibleFoundItems.length === 1 ? 'item' : 'items'} listed</p></div>{selectedFoundCategory && <button type="button" onClick={() => setSelectedFoundCategory('')} className="text-sm font-bold text-[#ffb09e] hover:text-white">Show all items</button>}</div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleFoundItems.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{item.item_name}</h3>
                    <p className="text-sm text-gray-500">{item.item_category}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    item.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'claimed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.item_description}</p>
                <p className="text-xs text-gray-500 mb-4">Found at: {item.found_location}</p>
                {item.reporter_phone && <p className="mb-4 text-sm font-semibold text-gray-700">Finder phone: {item.reporter_phone}</p>}
                <div className="flex space-x-2">
                  <a href={`/found/${item.id}`} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200">
                    View Details
                  </a>
                  <a href="/login" className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200">
                    Claim
                  </a>
                </div>
              </div>
            ))}
          </div></section>
        </>)}
        </>}
      </div>
    </main>
  );
}

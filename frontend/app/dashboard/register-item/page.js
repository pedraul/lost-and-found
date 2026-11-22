'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useItems, useDeviceTypes } from '../../../hooks/useItems';
import { registerItem } from '../../../services/items.api';
import { useAuth } from '../../../context/AuthContext';

// Device type specific form configurations
const DEVICE_TYPE_FORMS = {
  'phone': {
    category: 'Electronics',
    label: 'Phone',
    icon: '📱',
    identifiers: ['imei_number', 'serial_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number', 'imei_number'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'laptop': {
    category: 'Electronics',
    label: 'Laptop',
    icon: '💻',
    identifiers: ['serial_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'tablet': {
    category: 'Electronics',
    label: 'Tablet',
    icon: '📱',
    identifiers: ['serial_number', 'imei_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number', 'imei_number'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'camera': {
    category: 'Electronics',
    label: 'Camera',
    icon: '📷',
    identifiers: ['serial_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'car': {
    category: 'Vehicles',
    icon: '🚗',
    identifiers: ['vin_number', 'license_plate'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model', 'year'],
      identifiers: ['vin_number', 'license_plate'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'motorcycle': {
    category: 'Vehicles',
    icon: '🏍️',
    identifiers: ['vin_number', 'license_plate'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model', 'year'],
      identifiers: ['vin_number', 'license_plate'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'bicycle': {
    category: 'Vehicles',
    icon: '🚴',
    identifiers: ['serial_number', 'frame_size'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number', 'frame_size'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'passport': {
    category: 'Documents',
    icon: '📕',
    identifiers: ['passport_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'full_name'],
      identifiers: ['passport_number', 'issuing_country', 'date_of_birth', 'expiry_date'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'national_id': {
    category: 'Documents',
    icon: '🪪',
    identifiers: ['id_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'full_name'],
      identifiers: ['id_number', 'date_of_birth'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'speaker': {
    category: 'Audio',
    icon: '🔊',
    identifiers: ['serial_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'watch': {
    category: 'Accessories',
    icon: '⌚',
    identifiers: ['serial_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'tv': {
    category: 'Electronics',
    label: 'TV',
    icon: '📺',
    identifiers: ['serial_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'printer': {
    category: 'Electronics',
    label: 'Printer',
    icon: '🖨️',
    identifiers: ['serial_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'router': {
    category: 'Electronics',
    label: 'Router',
    icon: '📡',
    identifiers: ['serial_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'truck': {
    category: 'Vehicles',
    icon: '🚚',
    identifiers: ['vin_number', 'license_plate'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model', 'year'],
      identifiers: ['vin_number', 'license_plate'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'van': {
    category: 'Vehicles',
    icon: '🚐',
    identifiers: ['vin_number', 'license_plate'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model', 'year'],
      identifiers: ['vin_number', 'license_plate'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'hard_drive': {
    category: 'Electronics',
    label: 'Hard Drive',
    icon: '💾',
    identifiers: ['serial_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'projector': {
    category: 'Electronics',
    label: 'Projector',
    icon: '📽️',
    identifiers: ['serial_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
  'solar_box': {
    category: 'Electronics',
    label: 'Solar Box',
    icon: '☀️',
    identifiers: ['serial_number'],
    photos: ['receipt_image', 'device_image'],
    fields: {
      basic: ['item_name', 'model'],
      identifiers: ['serial_number'],
      location: ['country', 'province', 'district', 'sector', 'phone_number'],
    }
  },
};

// Device names/variants for each device type
const DEVICE_NAMES = {
  'phone': ['iPhone', 'Samsung Galaxy', 'Google Pixel', 'OnePlus', 'Xiaomi', 'Huawei', 'Nokia', 'Motorola'],
  'laptop': ['MacBook Air', 'MacBook Pro', 'Dell XPS', 'HP Pavilion', 'Lenovo ThinkPad', 'ASUS VivoBook', 'Acer Aspire', 'MSI'],
  'tablet': ['iPad', 'Samsung Galaxy Tab', 'iPad Pro', 'iPad Air', 'iPad Mini', 'Surface Pro', 'Huawei MatePad'],
  'camera': ['Canon EOS', 'Nikon D', 'Sony Alpha', 'GoPro', 'Fujifilm', 'Olympus', 'Panasonic Lumix'],
  'tv': ['Samsung QLED', 'LG OLED', 'Sony Bravia', 'TCL', 'Vizio', 'Philips', 'Panasonic'],
  'printer': ['HP LaserJet', 'Brother', 'Canon imageCLASS', 'Xerox', 'Ricoh', 'Epson'],
  'router': ['TP-Link', 'Netgear', 'Cisco', 'Asus', 'D-Link', 'Linksys', 'Belkin'],
  'speaker': ['JBL', 'Sony', 'Bose', 'Beats', 'Ultimate Ears', 'Marshall', 'Harman Kardon'],
  'watch': ['Apple Watch', 'Samsung Galaxy Watch', 'Fitbit', 'Garmin', 'Suunto', 'Polar'],
  'car': ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Chevrolet', 'Nissan'],
  'motorcycle': ['Harley-Davidson', 'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'KTM'],
  'bicycle': ['Trek', 'Giant', 'Specialized', 'Cannondale', 'Scott', 'Cube', 'Merida'],
  'hard_drive': ['Western Digital', 'Seagate', 'Samsung', 'Crucial', 'Intel', 'Kingston'],
  'projector': ['Epson', 'Sony', 'Benq', 'Optoma', 'Panasonic', 'JVC'],
  'solar_box': ['Goal Zero', 'Renogy', 'Jackery', 'Rockpals', 'ALLPOWER'],
  'passport': ['Passport', 'Diplomatic Passport', 'Service Passport'],
  'national_id': ['National ID Card', 'Citizen ID', 'Provincial ID'],
  'truck': ['Ford F-Series', 'Chevrolet Silverado', 'RAM', 'GMC', 'Toyota Tundra'],
  'van': ['Mercedes Sprinter', 'Ford Transit', 'Chevy Express', 'Toyota Sienna', 'Honda Odyssey'],
};

// Device models for each device type
const DEVICE_MODELS = {
  'phone': ['iPhone 14', 'iPhone 13', 'iPhone 12', 'Galaxy S23', 'Galaxy S22', 'Pixel 7', 'OnePlus 11', 'Xiaomi 13'],
  'laptop': ['Air M1', 'Air M2', 'Pro 14', 'Pro 16', 'XPS 13', 'XPS 15', 'ThinkPad X1', 'VivoBook 15'],
  'tablet': ['iPad 10th Gen', 'iPad Air 5', 'iPad Pro 12.9', 'Tab S8', 'Tab S8+', 'Surface Pro 9'],
  'camera': ['EOS R5', 'EOS 5D', 'D850', 'A7R V', 'A7C', 'GoPro Hero 11'],
  'tv': ['QN90C', 'LG C3', 'Bravia XR', 'TCL 6-Series', 'Vizio M-Series', 'Panasonic HZ2000'],
  'printer': ['M404n', 'L8360CDW', 'imageCLASS MF445dw', 'C605', 'MP C306'],
  'router': ['Archer AX6000', 'Nighthawk AX12', 'AX3000', 'Mesh System'],
  'speaker': ['Charge 5', 'SRS-XB33', 'SoundLink Max', 'Studio', 'Wonderboom 3'],
  'watch': ['Series 8', 'Ultra', 'Galaxy Watch 5', 'Charge 5', 'Fenix 7'],
  'car': ['Camry', 'Civic', '5 Series', 'C-Class', 'A4', 'Mustang'],
  'motorcycle': ['Street 750', 'CB500', 'MT-09', 'Ninja 400', 'GSX-S1000', '1290 Super Duke'],
  'bicycle': ['Domane', 'Defy', 'Tarmac', 'Synapse', 'Genius', 'Lux', 'Silex'],
  'hard_drive': ['Blue', 'IronWolf', 'Barracuda', 'MX500', 'PM1735', 'A2000'],
  'projector': ['EH-TW7000', 'VPL-PHZ10', 'SH535', 'UHZ65', 'PT-RZ870', 'DLA-NZ9'],
  'solar_box': ['Nomad 7', 'Phoenix', 'Port 500', 'Rock 300', 'AllPower 606'],
  'passport': ['P-Type', 'Booklet Format', 'Card Format'],
  'national_id': ['Standard', 'Enhanced', 'Biometric'],
  'truck': ['F-150', 'Silverado 1500', '1500', 'Sierra 1500', 'Tundra'],
  'van': ['Sprinter 2500', 'Transit 250', 'Express 2500', 'Sienna', 'Odyssey'],
};

const FIELD_LABELS = {
  item_name: 'Item Name',
  model: 'Model',
  year: 'Year',
  full_name: 'Full Name (Owner)',
  serial_number: 'Serial Number',
  imei_number: 'IMEI Number',
  vin_number: 'VIN Number',
  license_plate: 'License Plate',
  passport_number: 'Passport Number',
  id_number: 'ID Number',
  frame_size: 'Frame Size',
  date_of_birth: 'Date of Birth',
  issuing_country: 'Issuing Country',
  expiry_date: 'Expiry Date',
  country: 'Country',
  city: 'City',
  province: 'Province/State',
  district: 'District',
  sector: 'Sector',
  phone_number: 'Phone Number',
  notes: 'Additional Notes'
};

const PHOTO_LABELS = {
  receipt_image: '📄 Receipt/Proof of Purchase',
  device_image: '📸 Device Photo'
};

// Organize device types by category
const CATEGORIES = Object.values(DEVICE_TYPE_FORMS).reduce((acc, config) => {
  if (!acc[config.category]) {
    acc[config.category] = [];
  }
  return acc;
}, {});

Object.entries(DEVICE_TYPE_FORMS).forEach(([key, config]) => {
  CATEGORIES[config.category].push({ id: key, name: key, ...config });
});

export default function RegisterItemPage() {
  const router = useRouter();
  const { createItem, loading, error } = useItems();
  const { user, loading: authLoading } = useAuth();
  const { deviceTypes, loading: typesLoading } = useDeviceTypes();
  const [currentStep, setCurrentStep] = useState(1); // 1: Category, 2: Device Type, 3+: Form
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedDeviceName, setSelectedDeviceName] = useState('');
  const [formData, setFormData] = useState({
    device_type_id: '',
    item_name: '',
    model: '',
    year: '',
    full_name: '',
    serial_number: '',
    imei_number: '',
    vin_number: '',
    license_plate: '',
    passport_number: '',
    id_number: '',
    frame_size: '',
    date_of_birth: '',
    issuing_country: '',
    expiry_date: '',
    country: '',
    city: '',
    province: '',
    district: '',
    sector: '',
    phone_number: '',
    notes: '',
  });
  const [photos, setPhotos] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [registrationResult, setRegistrationResult] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    const subscription = user.subscription;
    if (subscription?.paymentOverdue) {
      router.replace('/dashboard/payment');
    }
  }, [authLoading, user, router]);


  const formConfig = DEVICE_TYPE_FORMS[selectedDeviceName] || {};
  const locationFields = formConfig.fields?.location
    ? ['country', 'city', ...formConfig.fields.location.filter((field) => field !== 'country' && field !== 'city')]
    : [];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentStep(2);
    setSelectedDeviceType('');
    setSelectedDeviceName('');
  };

  const handleDeviceTypeSelect = (deviceTypeName) => {
    // Find the device type in the database
    const dbDeviceType = deviceTypes.find(dt => dt.name === deviceTypeName);
    if (dbDeviceType) {
      setSelectedDeviceType(dbDeviceType.id);
      setFormData({ ...formData, device_type_id: dbDeviceType.id });
    }
    setSelectedDeviceName(deviceTypeName);
    setCurrentStep(3);
  };

  const handleBackToCategories = () => {
    setCurrentStep(1);
    setSelectedCategory('');
    setSelectedDeviceType('');
    setSelectedDeviceName('');
    setFormData({ ...formData, device_type_id: '' });
  };

  const handleBackToDeviceTypes = () => {
    setCurrentStep(2);
    setSelectedDeviceType('');
    setSelectedDeviceName('');
    setFormData({ ...formData, device_type_id: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e, photoField) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedPhotoTypes.includes(file.type)) {
      setSubmitError('Please select a real photo in JPG, PNG, WEBP, or HEIC format. ICO files are not item photos.');
      e.target.value = '';
      return;
    }

    try {
      setUploadProgress({ ...uploadProgress, [photoField]: 'uploading' });
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos({
          ...photos,
          [photoField]: {
            file: file,
            name: file.name,
            url: event.target?.result
          }
        });
        setUploadProgress({ ...uploadProgress, [photoField]: 'complete' });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadProgress({ ...uploadProgress, [photoField]: 'error' });
      alert('Failed to upload photo: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setPaymentRequired(false);
    
    // Check if all required photos are uploaded
    const requiredPhotos = formConfig.photos || [];
    const missingPhotos = requiredPhotos.filter(p => !photos[p]);
    if (missingPhotos.length > 0) {
      setSubmitError(`Missing required photos: ${missingPhotos.map(p => PHOTO_LABELS[p] || p).join(', ')}`);
      return;
    }

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([field, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          payload.append(field, value);
        }
      });
      Object.entries(photos).forEach(([photoField, photo]) => {
        if (photo?.file) payload.append(photoField, photo.file);
      });
      const result = await createItem(payload);
      setRegistrationResult(result);
    } catch (err) {
      setPaymentRequired(err.status === 402);
      setSubmitError(err.message);
    }
  };

  const copyVerificationCode = async () => {
    if (!registrationResult?.verificationCode) return;
    await navigator.clipboard.writeText(registrationResult.verificationCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const emailVerificationCode = () => {
    const code = registrationResult?.verificationCode;
    if (!code) return;
    const subject = encodeURIComponent('My item verification number');
    const body = encodeURIComponent(`My item verification number is: ${code}\n\nUse this number to search and verify my registered item.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (typesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-300 border-t-orange-600"></div>
          </div>
          <p className="text-slate-600">Loading device types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
      {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Register New Item</h1>
          <p className="text-slate-600">
            {currentStep === 1 && 'Step 1: Choose a category for your item'}
            {currentStep === 2 && 'Step 2: Select the specific device type'}
            {currentStep >= 3 && 'Complete all required fields and upload photos to protect your belongings'}
          </p>
        </div>

        {/* Error Message */}
        {(error || submitError) && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-800 font-medium">⚠️ {error || submitError}</p>
            {paymentRequired && (
              <p className="mt-2 text-sm text-red-700">
                Your annual account payment is not active. Complete payment before registering an item.
              </p>
            )}
          </div>
        )}

        {registrationResult?.verificationCode && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-green-700">Item registered successfully</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">Save your unique verification number</h2>
            <p className="mt-2 text-sm text-slate-600">Use this number when searching for or matching your item. Keep it private until you need to verify ownership.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <code className="rounded-lg border border-green-300 bg-white px-4 py-3 text-xl font-black tracking-widest text-slate-900">
                {registrationResult.verificationCode}
              </code>
              <button type="button" onClick={copyVerificationCode} className="rounded-full bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800">
                {codeCopied ? 'Copied' : 'Copy number'}
              </button>
              <button type="button" onClick={emailVerificationCode} className="rounded-full border border-green-700 px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-100">
                Email number
              </button>
              <button type="button" onClick={() => router.push('/dashboard/my-items')} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white">
                View my items
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Category Selection */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Step 1: Select a Category</h2>
            <p className="text-slate-600 mb-8">Choose what type of item you want to register</p>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {Object.keys(CATEGORIES).sort().map((category) => {
                const categoryIcon = DEVICE_TYPE_FORMS[CATEGORIES[category][0].id]?.icon || '📦';
                const deviceCount = CATEGORIES[category].length;
                return (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="min-w-0 p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-lg hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20 transition-all text-left group"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{categoryIcon}</div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors">{category}</h3>
                    <p className="text-sm text-slate-600 mt-2">{deviceCount} device{deviceCount !== 1 ? 's' : ''}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Device Type Selection */}
        {currentStep === 2 && selectedCategory && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-8">
            <div className="mb-8">
              <button
                onClick={handleBackToCategories}
                className="text-orange-600 hover:text-orange-700 font-semibold mb-4 flex items-center gap-2"
              >
                ← Back to Categories
              </button>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Step 2: Select a Device Type</h2>
              <p className="text-slate-600">Choose the specific {selectedCategory} item you're registering</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {CATEGORIES[selectedCategory].map((deviceType) => (
                <button
                  key={deviceType.id}
                  onClick={() => handleDeviceTypeSelect(deviceType.id)}
                  className="min-w-0 p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-lg hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20 transition-all text-left group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{deviceType.icon}</div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors">{deviceType.label || deviceType.id.replace(/_/g, ' ')}</h3>
                  <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                    📸 {deviceType.photos.length} photo{deviceType.photos.length !== 1 ? 's' : ''}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3+: Registration Form */}
        {currentStep >= 3 && selectedDeviceName && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
            {/* Navigation */}
            <div className="mb-8">
              <button
                type="button"
                onClick={handleBackToDeviceTypes}
                className="text-orange-600 hover:text-orange-700 font-semibold mb-4 flex items-center gap-2"
              >
                ← Back to Device Types
              </button>
              <div className="inline-block px-4 py-2 bg-orange-50 border border-orange-200 rounded-full mb-4">
                <span className="text-sm font-semibold text-orange-700">
                  {formConfig.icon} {formConfig.category} - {selectedDeviceName.charAt(0).toUpperCase() + selectedDeviceName.slice(1).replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Step 4: Basic Information */}
            <div className="pb-8 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-4">Item Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formConfig.fields?.basic?.map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {FIELD_LABELS[field]} *
                    </label>
                    {field === 'year' ? (
                      <input
                        type="number"
                        name={field}
                        required
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20"
                        placeholder={FIELD_LABELS[field]}
                      />
                    ) : field === 'item_name' ? (
                      <select
                        name={field}
                        required
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 bg-white text-slate-900"
                      >
                        <option value="">Select device name</option>
                        {(DEVICE_NAMES[selectedDeviceName] || []).map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    ) : field === 'model' ? (
                      <select
                        name={field}
                        required
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 bg-white text-slate-900"
                      >
                        <option value="">Select model</option>
                        {(DEVICE_MODELS[selectedDeviceName] || []).map((model) => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={field}
                        required
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20"
                        placeholder={FIELD_LABELS[field]}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 5: Identifiers */}
            {formConfig.fields?.identifiers && formConfig.fields.identifiers.length > 0 && (
              <div className="pb-8 border-b border-slate-200">
                <h2 className="text-xl font-black text-slate-900 mb-4">Identification Numbers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formConfig.fields.identifiers.map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {FIELD_LABELS[field]} {formConfig.identifiers?.includes(field) ? '*' : '(Optional)'}
                      </label>
                      {field === 'date_of_birth' || field === 'expiry_date' ? (
                        <input
                          type="date"
                          name={field}
                          required={formConfig.identifiers?.includes(field)}
                          value={formData[field]}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20"
                        />
                      ) : (
                        <input
                          type="text"
                          name={field}
                          required={formConfig.identifiers?.includes(field)}
                          value={formData[field]}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20"
                          placeholder={FIELD_LABELS[field]}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Location & Contact Information */}
            {formConfig.fields?.location && formConfig.fields.location.length > 0 && (
              <div className="pb-8 border-b border-slate-200">
                <h2 className="text-xl font-black text-slate-900 mb-4">Location & Contact Information *</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {locationFields.map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {FIELD_LABELS[field]} *
                      </label>
                      <input
                        type="text"
                        name={field}
                        required
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20"
                        placeholder={FIELD_LABELS[field]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Photos */}
            <div className="pb-8 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-4">Upload Photos *</h2>
              <p className="text-sm text-slate-600 mb-4">Please provide clear photos of:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formConfig.photos?.map((photoField) => (
                  <div key={photoField} className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-orange-300 transition-all">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      {PHOTO_LABELS[photoField]} *
                    </label>
                    {photos[photoField]?.url ? (
                      <div className="space-y-3">
                        <img src={photos[photoField].url} alt={photoField} className="w-full h-40 object-cover rounded-lg" />
                        <p className="text-xs text-green-600 font-medium">✓ {photos[photoField].name}</p>
                        <button
                          type="button"
                          onClick={() => setPhotos({ ...photos, [photoField]: null })}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Change photo
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        onChange={(e) => handlePhotoChange(e, photoField)}
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 8: Additional Notes */}
            <div className="pb-8">
              <h2 className="text-xl font-black text-slate-900 mb-4">Additional Information</h2>
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional details about your item..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.push('/dashboard/my-items')}
                className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Registering...' : '✓ Register Item'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

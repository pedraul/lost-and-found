'use client';

import { useState } from 'react';

export default function ImageUploader({ onUpload, accept = 'image/*', multiple = false }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onUpload?.(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
      <div className="space-y-1 text-center">
        {preview ? (
          <img src={preview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded" />
        ) : (
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v12m0 0v4m0-4H36m-4 4h8m-8 0H28m-4 4h8m-8 0H20"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <div className="flex text-sm text-gray-600 justify-center">
          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
            <span>Upload a file</span>
            <input
              type="file"
              className="sr-only"
              accept={accept}
              multiple={multiple}
              onChange={handleChange}
              disabled={loading}
            />
          </label>
        </div>
        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
      </div>
    </div>
  );
}

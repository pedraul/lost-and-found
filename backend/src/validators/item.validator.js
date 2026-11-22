const Joi = require('joi');

const registerItemSchema = Joi.object({
  // Device Selection
  device_type_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'any.required': 'Device type is required',
      'string.guid': 'Invalid device type ID'
    }),
  manufacturer_id: Joi.string()
    .uuid()
    .optional()
    .allow(null, '')
    .messages({
      'string.guid': 'Invalid manufacturer ID'
    }),

  // Basic Information
  item_name: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.max': 'Item name cannot exceed 255 characters',
      'any.required': 'Item name is required'
    }),
  model: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': 'Model cannot exceed 100 characters',
      'any.required': 'Model is required'
    }),

  // Identifiers (Conditional based on device type)
  serial_number: Joi.string()
    .max(100)
    .messages({
      'string.max': 'Serial number cannot exceed 100 characters'
    }),
  imei_number: Joi.string()
    .pattern(/^[0-9]{15}$/)
    .messages({
      'string.pattern.base': 'IMEI must be exactly 15 digits'
    }),
  vin_number: Joi.string()
    .pattern(/^[A-HJ-NPR-Z0-9]{17}$/)
    .messages({
      'string.pattern.base': 'VIN must be exactly 17 characters'
    }),
  id_number: Joi.string()
    .max(100)
    .messages({
      'string.max': 'ID number cannot exceed 100 characters'
    }),
  passport_number: Joi.string()
    .max(20)
    .messages({
      'string.max': 'Passport number cannot exceed 20 characters'
    }),
  license_plate: Joi.string()
    .max(20)
    .messages({
      'string.max': 'License plate cannot exceed 20 characters'
    }),
  frame_size: Joi.string()
    .max(20)
    .messages({
      'string.max': 'Frame size cannot exceed 20 characters'
    }),

  // Document fields
  full_name: Joi.string()
    .max(255)
    .messages({
      'string.max': 'Full name cannot exceed 255 characters'
    }),
  date_of_birth: Joi.date()
    .iso()
    .messages({
      'date.format': 'Date of birth must be a valid date (YYYY-MM-DD)'
    }),
  issuing_country: Joi.string()
    .max(100)
    .messages({
      'string.max': 'Issuing country cannot exceed 100 characters'
    }),
  expiry_date: Joi.date()
    .messages({
      'date.base': 'Expiry date must be a valid date'
    }),

  // Vehicle fields
  year: Joi.number()
    .integer()
    .min(1886)
    .max(new Date().getFullYear())
    .messages({
      'number.base': 'Year must be a number',
      'number.min': `Year cannot be before 1886`,
      'number.max': `Year cannot be in the future`
    }),

  // Purchase information
  cost: Joi.number()
    .precision(2)
    .messages({
      'number.base': 'Cost must be a number'
    }),
  currency: Joi.string()
    .length(3)
    .uppercase()
    .default('USD')
    .messages({
      'string.length': 'Currency must be a 3-letter code'
    }),
  purchase_date: Joi.date()
    .iso()
    .messages({
      'date.format': 'Purchase date must be valid (YYYY-MM-DD)'
    }),
  purchase_store_name: Joi.string()
    .max(255)
    .messages({
      'string.max': 'Purchase store name cannot exceed 255 characters'
    }),

  // Location and contact fields
  country: Joi.string().max(100),
  city: Joi.string().max(100),
  province: Joi.string().max(100),
  district: Joi.string().max(100),
  sector: Joi.string().max(100),
  phone_number: Joi.string().max(30),

  // Required Images
  receipt_image_url: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'Receipt image URL must be a valid URL',
      'any.required': 'Receipt image is required'
    }),
  receipt_file_name: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.max': 'Receipt file name cannot exceed 255 characters',
      'any.required': 'Receipt file name is required'
    }),
  front_image_url: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'Front image URL must be a valid URL',
      'any.required': 'Front image is required'
    }),
  front_file_name: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.max': 'Front file name cannot exceed 255 characters',
      'any.required': 'Front file name is required'
    }),
  back_image_url: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'Back image URL must be a valid URL',
      'any.required': 'Back image is required'
    }),
  back_file_name: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.max': 'Back file name cannot exceed 255 characters',
      'any.required': 'Back file name is required'
    }),
  serial_image_url: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'Serial image URL must be a valid URL',
      'any.required': 'Serial image is required'
    }),
  serial_file_name: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.max': 'Serial file name cannot exceed 255 characters',
      'any.required': 'Serial file name is required'
    }),

  // Additional images (device-specific)
  screen_image_url: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Screen image URL must be a valid URL'
  }),
  screen_file_name: Joi.string().max(255).allow('', null).messages({
    'string.max': 'Screen file name cannot exceed 255 characters'
  }),
  side_image_url: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Side image URL must be a valid URL'
  }),
  side_file_name: Joi.string().max(255).allow('', null).messages({
    'string.max': 'Side file name cannot exceed 255 characters'
  }),
  interior_image_url: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Interior image URL must be a valid URL'
  }),
  interior_file_name: Joi.string().max(255).allow('', null).messages({
    'string.max': 'Interior file name cannot exceed 255 characters'
  }),
  cargo_image_url: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Cargo image URL must be a valid URL'
  }),
  cargo_file_name: Joi.string().max(255).allow('', null).messages({
    'string.max': 'Cargo file name cannot exceed 255 characters'
  }),
  drivetrain_image_url: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Drivetrain image URL must be a valid URL'
  }),
  drivetrain_file_name: Joi.string().max(255).allow('', null).messages({
    'string.max': 'Drivetrain file name cannot exceed 255 characters'
  }),
  frame_image_url: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Frame image URL must be a valid URL'
  }),
  frame_file_name: Joi.string().max(255).allow('', null).messages({
    'string.max': 'Frame file name cannot exceed 255 characters'
  }),
  full_bike_image_url: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Full bike image URL must be a valid URL'
  }),
  full_bike_file_name: Joi.string().max(255).allow('', null).messages({
    'string.max': 'Full bike file name cannot exceed 255 characters'
  }),
  id_front_image_url: Joi.string().uri().allow('', null).messages({
    'string.uri': 'ID front image URL must be a valid URL'
  }),
  id_front_file_name: Joi.string().max(255).allow('', null).messages({
    'string.max': 'ID front file name cannot exceed 255 characters'
  }),
  id_back_image_url: Joi.string().uri().allow('', null).messages({
    'string.uri': 'ID back image URL must be a valid URL'
  }),
  id_back_file_name: Joi.string().max(255).allow('', null).messages({
    'string.max': 'ID back file name cannot exceed 255 characters'
  }),
  passport_photo_image_url: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Passport photo image URL must be a valid URL'
  }),
  passport_photo_file_name: Joi.string().max(255).allow('', null).messages({
    'string.max': 'Passport photo file name cannot exceed 255 characters'
  }),
  passport_id_image_url: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Passport ID image URL must be a valid URL'
  }),
  passport_id_file_name: Joi.string().max(255).allow('', null).messages({
    'string.max': 'Passport ID file name cannot exceed 255 characters'
  }),

  // Verification Code (auto-generated)
  verification_code: Joi.string()
    .length(19)
    .optional()
    .messages({
      'string.length': 'Verification code must be exactly 19 characters',
      'any.required': 'Verification code is required'
    }),
  verification_code_hash: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Verification code hash cannot exceed 255 characters',
      'any.required': 'Verification code hash is required'
    }),
  qr_code_url: Joi.string()
    .uri()
    .allow('', null)
    .messages({
      'string.uri': 'QR code URL must be a valid URL'
    }),

  // Status
  status: Joi.string()
    .valid('active', 'lost', 'stolen', 'returned', 'deleted', 'transferred')
    .default('active')
    .messages({
      'any.only': 'Invalid status value'
    }),
  is_public: Joi.boolean()
    .default(true)
    .messages({
      'any.only': 'is_public must be a boolean'
    }),
  is_verified: Joi.boolean()
    .default(false)
    .messages({
      'any.only': 'is_verified must be a boolean'
    }),
  trust_score: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Trust score cannot be negative'
    }),

  // Ownership
  ownership_start_date: Joi.date()
    .default(() => new Date())
    .messages({
      'date.base': 'Ownership start date must be a valid date'
    }),
  ownership_end_date: Joi.date().allow(null).messages({
    'date.base': 'Ownership end date must be a valid date'
  }),
  previous_owner_id: Joi.string().uuid().allow(null).messages({
    'string.guid': 'Previous owner ID must be a valid UUID'
  }),
  transfer_count: Joi.number().integer().min(0).default(0).messages({
    'number.min': 'Transfer count cannot be negative'
  }),
  last_verified_at: Joi.date().allow(null).messages({
    'date.base': 'Last verified date must be a valid date'
  }),

  // Additional
  notes: Joi.string().allow('', null).max(5000).messages({
    'string.max': 'Notes cannot exceed 5000 characters'
  }),
  tags: Joi.array().items(Joi.string()).allow(null).messages({
    'array.base': 'Tags must be an array of strings'
  })
});

module.exports = { registerItemSchema };
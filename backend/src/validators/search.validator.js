const Joi = require('joi');

const searchItemsSchema = Joi.object({
  query: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.min': 'Search query must be at least 2 characters',
      'string.max': 'Search query cannot exceed 255 characters',
      'any.required': 'Search query is required'
    }),
  category: Joi.string()
    .max(50)
    .allow('', null)
    .messages({
      'string.max': 'Category cannot exceed 50 characters'
    }),
  manufacturer: Joi.string()
    .max(100)
    .allow('', null)
    .messages({
      'string.max': 'Manufacturer cannot exceed 100 characters'
    }),
  status: Joi.string()
    .valid('active', 'lost', 'stolen', 'returned', 'transferred')
    .allow('', null)
    .messages({
      'any.only': 'Invalid status value'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'item_name', 'status', 'trust_score')
    .default('created_at')
    .messages({
      'any.only': 'Invalid sort field'
    }),
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .default('DESC')
    .messages({
      'any.only': 'Sort order must be ASC or DESC'
    })
});

const checkItemStatusSchema = Joi.object({
  identifier: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Identifier must be at least 3 characters',
      'string.max': 'Identifier cannot exceed 100 characters',
      'any.required': 'Item identifier is required'
    }),
  identifier_type: Joi.string()
    .valid('serial_number', 'imei_number', 'vin_number', 'id_number', 'passport_number', 'license_plate', 'verification_code')
    .required()
    .messages({
      'any.only': 'Identifier type must be one of: serial_number, imei_number, vin_number, id_number, passport_number, license_plate, verification_code',
      'any.required': 'Identifier type is required'
    })
});

module.exports = {
  searchItemsSchema,
  checkItemStatusSchema
};
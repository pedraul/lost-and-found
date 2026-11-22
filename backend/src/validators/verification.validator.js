const Joi = require('joi');

const verifyCodeSchema = Joi.object({
  code: Joi.string()
    .length(19)
    .required()
    .messages({
      'string.length': 'Verification code must be exactly 19 characters (XXXX-XXXX-XXXX-XXXX)',
      'any.required': 'Verification code is required'
    })
});

const createVerificationSchema = Joi.object({
  verification_method: Joi.string()
    .valid('code', 'qr', 'identifier', 'manual')
    .required()
    .messages({
      'any.only': 'Verification method must be one of: code, qr, identifier, manual',
      'any.required': 'Verification method is required'
    }),
  verification_code: Joi.string()
    .length(19)
    .allow('', null)
    .messages({
      'string.length': 'Verification code must be exactly 19 characters'
    }),
  notes: Joi.string()
    .allow('', null)
    .max(2000)
    .messages({
      'string.max': 'Notes cannot exceed 2000 characters'
    }),
  location: Joi.string()
    .allow('', null)
    .max(255)
    .messages({
      'string.max': 'Location cannot exceed 255 characters'
    })
});

const verifyItemByIdentifierSchema = Joi.object({
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
    .valid('serial_number', 'imei_number', 'vin_number', 'id_number', 'passport_number', 'license_plate')
    .required()
    .messages({
      'any.only': 'Identifier type must be one of: serial_number, imei_number, vin_number, id_number, passport_number, license_plate',
      'any.required': 'Identifier type is required'
    })
});

const claimItemSchema = Joi.object({
  claim_notes: Joi.string()
    .allow('', null)
    .max(2000)
    .messages({
      'string.max': 'Claim notes cannot exceed 2000 characters'
    }),
  claim_proof_details: Joi.string()
    .allow('', null)
    .max(5000)
    .messages({
      'string.max': 'Claim proof details cannot exceed 5000 characters'
    })
});

const verifyOwnershipSchema = Joi.object({
  verification_code: Joi.string()
    .length(19)
    .required()
    .messages({
      'string.length': 'Verification code must be exactly 19 characters',
      'any.required': 'Verification code is required'
    }),
  item_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Item ID must be a valid UUID',
      'any.required': 'Item ID is required'
    })
});

module.exports = {
  verifyCodeSchema,
  createVerificationSchema,
  verifyItemByIdentifierSchema,
  claimItemSchema,
  verifyOwnershipSchema
};

const Joi = require('joi');

/**
 * Validation middleware - validates request data using Joi schemas
 * @param {Joi.Schema} schema - The Joi validation schema
 * @param {string} target - Request property to validate: 'body', 'query', 'params'
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const data = req[target];
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.statusCode = 400;
      validationError.errors = errors;
      validationError.isJoi = true;
      return next(validationError);
    }

    req[target] = value;
    next();
  };
};

module.exports = { validate };
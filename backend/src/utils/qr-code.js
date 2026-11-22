const QRCode = require('qrcode');
const env = require('../config/env');

/**
 * Generate a QR code image as a data URL
 * @param {string} payload - The data to encode (usually verification code)
 * @returns {Promise<string>} - Data URL of the QR code
 */
const generateQRCode = async (payload) => {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (error) {
    throw new Error(`QR code generation failed: ${error.message}`);
  }
};

/**
 * Generate a QR code specifically for item verification
 * The code encodes a verification URL that anyone can scan
 */
const generateItemVerificationQR = async (verificationCode, itemId) => {
  const verifyUrl = `${env.frontendUrl}/verify?code=${verificationCode}&item=${itemId}`;
  return generateQRCode(verifyUrl);
};

/**
 * Generate a QR code for a found item (for finders to scan/display)
 */
const generateFoundItemQR = async (foundVerificationCode, foundItemId) => {
  const foundUrl = `${env.frontendUrl}/found/${foundItemId}?code=${foundVerificationCode}`;
  return generateQRCode(foundUrl);
};

module.exports = {
  generateQRCode,
  generateItemVerificationQR,
  generateFoundItemQR
};
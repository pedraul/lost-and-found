const PaymentSetting = require('../models/PaymentSetting');
const env = require('../config/env');

const getAnnualAmount = async () => {
  const setting = await PaymentSetting.findByPk('annual_amount_rwf');
  return setting ? parseInt(setting.value, 10) : env.paypack.annualAmount;
};

const setAnnualAmount = async (amount) => {
  const setting = await PaymentSetting.findByPk('annual_amount_rwf');
  if (setting) await setting.update({ value: String(amount) });
  else await PaymentSetting.create({ key: 'annual_amount_rwf', value: String(amount) });
  return amount;
};

const getReceivingNumber = async () => {
  const setting = await PaymentSetting.findByPk('payment_receiving_number');
  return setting?.value || '';
};

const setReceivingNumber = async (number) => {
  const setting = await PaymentSetting.findByPk('payment_receiving_number');
  if (setting) await setting.update({ value: number });
  else await PaymentSetting.create({ key: 'payment_receiving_number', value: number });
  return number;
};

module.exports = { getAnnualAmount, setAnnualAmount, getReceivingNumber, setReceivingNumber };

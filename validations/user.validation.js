const Joi = require('joi');

// Skema validasi untuk pengguna
const registerValidationSchema = Joi.object({
  nama: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  alamat: Joi.string().valid('TELUK', 'BERKOH', 'TANJUNG', 'KARANGKLESEM', 'PURWOKERTO_KIDUL', 'KARANGPUCUNG').optional(),
  role: Joi.string().valid('ADMIN', 'PENJUAL', 'PEMBELI').default('pembeli'),
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  registerValidationSchema,
  loginUserSchema,
};

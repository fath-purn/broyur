const Joi = require('joi');

// Skema validasi untuk pengguna
const transaksiValidationSchema = Joi.array().items(
  Joi.object({
    id_produk: Joi.number().required(),
    jumlah: Joi.number().required(),
    alamat: Joi.string().required(),
    pembayaran: Joi.string().valid('TRANSFER', 'CASH').required(),
  })
);

const transaksiUpdateValidationSchema = Joi.object({
  jumlah: Joi.number(),
  alamat: Joi.string(),
  status: Joi.string().valid('SELESAI', 'MENUNGGU', 'DITOLAK', 'DIPROSES', 'DIKONFIRMASI'),
  pembayaran: Joi.string().valid('TRANSFER', 'CASH'),
});

const validateTransactionValidationSchema = Joi.object({
  status: Joi.string().valid('SELESAI', 'MENUNGGU', 'DITOLAK', 'DIPROSES', 'DIKONFIRMASI').required(),
  note: Joi.string().optional(),
});

module.exports = {
  transaksiValidationSchema,
  transaksiUpdateValidationSchema,
  validateTransactionValidationSchema,
};

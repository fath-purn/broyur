const Joi = require("joi");

// Skema validasi untuk pengguna
const transaksiValidationSchema = Joi.object({
  id_produk: Joi.number().required(),
  jumlah: Joi.number().required(),
  alamat: Joi.string().required(),
  status: Joi.string().valid("SELESAI", "MENUNGGU", "DITOLAK", "DIPROSES", "DIKONFIRMASI").required(),
  pembayaran: Joi.string().valid("TRANSFER", "CASH").required(),
});

const transaksiUpdateValidationSchema = Joi.object({
    jumlah: Joi.number(),
    alamat: Joi.number(),
    status: Joi.string().valid("SELESAI", "MENUNGGU", "DITOLAK", "DIPROSES", "DIKONFIRMASI"),
    pembayaran: Joi.string().valid("TRANSFER", "CASH"),
});

module.exports = {
  transaksiValidationSchema,
  transaksiUpdateValidationSchema,
};

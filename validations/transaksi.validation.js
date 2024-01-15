const Joi = require("joi");

// Skema validasi untuk pengguna
const produkValidationSchema = Joi.object({
  jumlah: Joi.number().required(),
  harga: Joi.number().required(),
  alamat: Joi.string().required(),
  pembayaran: Joi.string().valid("SELESAI", "MENUNGGU", "DITOLAK", "DIPROSES", "DIKONFIRMASI").required(),
  status: Joi.string().valid("TRANSFER", "CASH").required(),
});

const produkUpdateValidationSchema = Joi.object({
    jumlah: Joi.string(),
    harga: Joi.string(),
    alamat: Joi.number(),
    pembayaran: Joi.string().valid("SELESAI", "MENUNGGU", "DITOLAK", "DIPROSES", "DIKONFIRMASI"),
    status: Joi.string().valid("TRANSFER", "CASH"),
});

module.exports = {
  produkValidationSchema,
  produkUpdateValidationSchema,
};

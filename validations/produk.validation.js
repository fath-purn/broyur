const Joi = require("joi");

// Skema validasi untuk pengguna
const produkValidationSchema = Joi.object({
  nama: Joi.string().required(),
  deskripsi: Joi.string().required(),
  harga: Joi.number().required(),
  satuan: Joi.string().required(),
  stok: Joi.number().required(),
  kategori: Joi.string().valid("SAYUR", "DAGING_DAN_IKAN", "BUAH", "TELUR_TAHU_TEMPE").required(),
});

const produkUpdateValidationSchema = Joi.object({
  nama: Joi.string(),
  deskripsi: Joi.string(),
  harga: Joi.number(),
  satuan: Joi.string(),
  stok: Joi.number(),
  kategori: Joi.string().valid("SAYUR", "DAGING_DAN_IKAN", "BUAH", "TELUR_TAHU_TEMPE"),
});

module.exports = {
  produkValidationSchema,
  produkUpdateValidationSchema,
};

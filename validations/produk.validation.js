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

module.exports = {
  produkValidationSchema,
};

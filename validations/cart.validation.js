const joi = require('joi');

const cartValidationSchema = joi.array().items(
  joi.object({
    id_produk: joi.number().required(),
    jumlah: joi.number().required(),
  })
);

const addToCartValidationSchema = joi.object({
  jumlah: joi.number().required(),
});

module.exports = {
  cartValidationSchema,
  addToCartValidationSchema,
};

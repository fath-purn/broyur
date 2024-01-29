const router = require('express').Router();

router.use('/user', require('./user.route'));
router.use('/produk', require('./produk.route'));
router.use('/transaksi', require('./transaksi.route'));
router.use('/cart', require('./cart.route'));

module.exports = router;

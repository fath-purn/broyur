const router = require('express').Router();

router.use('/user', require('./user.route'));
router.use('/produk', require('./produk.route'));
router.use('/transaksi', require('./transaksi.route'));

module.exports = router;

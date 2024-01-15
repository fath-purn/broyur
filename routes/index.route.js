const router = require('express').Router();

router.use('/user', require('./user.route'));
router.use('/produk', require('./produk.route'));
// router.use('/auth', require('./auth.route'));

module.exports = router;

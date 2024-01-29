const router = require('express').Router();
const { addToCart, getCart } = require('../controllers/cart.controller');
const { checkAdminPenjual, checkPembeli, checkAdmin } = require('../controllers/user.controller');
const verifyToken = require('../libs/verifyToken');

router.post('/add/:id', verifyToken, checkPembeli, addToCart);
router.get('/',verifyToken, checkPembeli, getCart);

module.exports = router;

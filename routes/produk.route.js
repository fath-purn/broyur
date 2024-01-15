const router = require("express").Router();
const { createProduk, getAll, getById, updateProduk, deleteProduk } = require("../controllers/produk.controller");
const {
  checkAdminPenjual,
  checkPembeli,
  checkAdmin,
} = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");
const { upload } = require("../libs/multer");

router.post("/", upload.array("image"), verifyToken, checkAdminPenjual, createProduk);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", verifyToken, checkAdminPenjual, updateProduk);
router.delete("/:id", verifyToken, checkAdminPenjual, deleteProduk);

module.exports = router;

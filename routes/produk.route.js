const router = require("express").Router();
const { createProduk, getAll, getById } = require("../controllers/produk.controller");
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
// router.put("/:id", upload.array("image"), verifyToken, updateWarung);
// router.delete("/:id", verifyToken, checkAdmin, deleteWarung);

module.exports = router;

const router = require("express").Router();
const {
  createProduk,
  getAll,
  getById,
  updateProduk,
  deleteProduk,
  getAllPenjual,
  getByIdPenjual,
  getAllPembeli,
} = require("../controllers/produk.controller");
const {
  checkAdminPenjual,
  checkPembeli,
  checkAdmin,
} = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");
const { upload } = require("../libs/multer");

router.post(
  "/add",
  upload.array("image"),
  verifyToken,
  checkAdminPenjual,
  createProduk
);
router.get("/", getAll);
router.get("/pembeli", verifyToken, getAllPembeli);
router.get("/penjual", verifyToken, checkAdminPenjual, getAllPenjual);
router.get("/penjual/:id", verifyToken, checkAdminPenjual, getByIdPenjual);
router.get("/:id", getById);
router.put("/update/:id", verifyToken, checkAdminPenjual, updateProduk);
router.delete("/delete/:id", verifyToken, checkAdminPenjual, deleteProduk);

module.exports = router;

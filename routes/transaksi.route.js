const router = require("express").Router();
const { createTransaksi,
    getAll,
    getById,
    updateTransaksi,
    deleteTransaksi,
} = require("../controllers/transaksi.controller");
const {
  checkAdminPenjual,
  checkPembeli,
  checkAdmin,
} = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");
const { upload } = require("../libs/multer");

router.post("/add", verifyToken, createTransaksi);
router.get("/", verifyToken, getAll);
router.get("/:id", verifyToken, getById);
router.put("/edit/:id", verifyToken, updateTransaksi);
router.delete("/delete/:id", verifyToken, deleteTransaksi);

module.exports = router;

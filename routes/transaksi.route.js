const router = require("express").Router();
const { createTransaksi,
    getAll,
    getById,
    updateTransaksi,
    deleteTransaksi,
    validateTransaksi,
    myTransaction
} = require("../controllers/transaksi.controller");
const {
  checkAdminPenjual,
  checkPembeli,
  checkAdmin,
} = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");
const { upload } = require("../libs/multer");

router.post("/add", verifyToken,checkPembeli,  createTransaksi);
router.get("/", verifyToken, getAll);
router.get("/me", verifyToken, myTransaction);
router.get("/:id", verifyToken, getById);
router.put("/edit/:id", verifyToken, checkAdminPenjual, updateTransaksi);
router.put("/update/:id", verifyToken, checkAdminPenjual, validateTransaksi);
router.delete("/delete/:id", verifyToken, deleteTransaksi);

module.exports = router;

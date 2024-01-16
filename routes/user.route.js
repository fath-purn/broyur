const router = require("express").Router();
const {
  register,
  login,
  authenticate,
  getAll,
} = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");
const { upload } = require("../libs/multer");

router.post("/register", upload.single("image"), register);
router.post("/login", login);
router.get('/', getAll);
router.get("/whoami", verifyToken, authenticate);

module.exports = router;

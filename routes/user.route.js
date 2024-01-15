const router = require("express").Router();
const {
  register,
  login,
  authenticate,
  getAll,
} = require("../controllers/user.controller");
const verifyToken = require("../libs/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.get('/', getAll);
router.get("/whoami", verifyToken, authenticate);

module.exports = router;

require("dotenv").config();
const prisma = require("../libs/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  registerValidationSchema,
  loginUserSchema,
} = require("../validations/user.validation");

// register
const register = async (req, res, next) => {
  try {
    console.log(req.body, "body");
    const { value, error } = await registerValidationSchema.validate(req.body);
    //   console.log(value, "value");D

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const { nama, email, password, alamat, role } = value;

    let userExist = await prisma.user.findUnique({
      where: { email: email },
    });
    if (userExist) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: "Email already exists!",
        data: null,
      });
    }

    let encryptedPassword = await bcrypt.hash(password, 10);

    let users = await prisma.user.create({
      data: {
        email,
        password: encryptedPassword,
        nama,
        alamat,
        role,
      },
    });

    delete users.password;

    return res.status(201).json({
      status: true,
      message: "OK!",
      err: null,
      data: users,
    });
  } catch (err) {
    next(err);
    return res.status(404).json({
      status: true,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { value, error } = await loginUserSchema.validateAsync({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Bad Request",
        err: "User not found",
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        err: "Wrong Email or Password",
        data: null,
      });
    }

    const payload = {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      phone_number: user.phone_number,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    delete user.password;

    return res.status(200).json({
      success: true,
      message: "OK!",
      err: null,
      data: {
        user: user,
        token: token,
      },
    });
  } catch (err) {
    next(err);
    return res.status(404).json({
      status: true,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const authenticate = async (req, res, next) => {
  try {
    const { user } = req;

    const userDetail = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    delete userDetail.password;

    return res.status(200).json({
      status: true,
      message: "OK!",
      err: null,
      data: userDetail,
    });
  } catch (err) {
    next(err);
    return res.status(404).json({
      status: true,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const checkAdmin = async (req, res, next) => {
  try {
    const { user } = req;

    const userDetail = await prisma.user.findUnique({
      where: {
        id: user.id,
        role: "ADMIN", // Filter berdasarkan role 'admin'
      },
    });

    if (!userDetail) {
      return res.status(404).json({
        status: true,
        message: "Admin only",
        err: "Only admins can use this command",
        data: null,
      });
    }

    next();
  } catch (err) {
    next(err);
    return res.status(404).json({
      status: true,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const getAll = async (req, res, next) => {
  try {
    const getAll = await prisma.user.findMany({
      where: {
        NOT: {
          role: "ADMIN",
        },
      },
    });

    delete getAll.password;

    return res.status(200).json({
      success: true,
      message: "OK!",
      err: null,
      data: getAll,
    });
  } catch (err) {
    next(err);
    return res.status(404).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

module.exports = {
  register,
  login,
  authenticate,
  checkAdmin,
  getAll,
};

require("dotenv").config();
const prisma = require("../libs/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  registerValidationSchema,
  loginUserSchema,
} = require("../validations/user.validation");
const imagekit = require("../libs/imagekit");
const path = require("path");
const Joi = require("joi");

// register
const register = async (req, res, next) => {
  try {
    const { value, error } = await registerValidationSchema.validate(req.body);

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

    // fungsi uploadFiles untuk imagekit
    const uploadFiles = async (file, id_user) => {
      try {
        let strFile = file.buffer.toString("base64");

        let { url, fileId } = await imagekit.upload({
          fileName: Date.now() + path.extname(file.originalname),
          file: strFile,
        });

        const gambar = await prisma.media.create({
          data: {
            id_link: fileId,
            link: url,
            id_user: id_user,
          },
        });

        return gambar;
      } catch (err) {
        return res.status(404).json({
          status: false,
          message: "Bad Request!",
          err: err.message,
          data: null,
        });
      }
    };

    if (req.file) {
      await uploadFiles(req.file, users.id);
    }

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
      include: {
        media: true,
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

const checkPembeli = async (req, res, next) => {
  try {
    const { user } = req;

    const userDetail = await prisma.user.findUnique({
      where: {
        id: user.id,
        role: "PEMBELI", // Filter berdasarkan role 'admin'
      },
    });

    if (!userDetail) {
      return res.status(404).json({
        status: true,
        message: "Bad Request!",
        err: "Kamu bukan pembeli",
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

const checkAdminPenjual = async (req, res, next) => {
  try {
    const { user } = req;

    const userDetail = await prisma.user.findUnique({
      where: {
        id: user.id,
        OR: [{ role: "ADMIN" }, { role: "PENJUAL" }],
      },
    });

    if (!userDetail) {
      return res.status(404).json({
        status: true,
        message: "Bad Request",
        err: "Kamu bukan admin ataupun penjual",
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
    let getUsers = null;

    const queryValidationSchema = Joi.object({
      search: Joi.string().allow(""),
      alamat: Joi.string()
        .valid(
          "TELUK",
          "BERKOH",
          "TANJUNG",
          "KARANGKLESEM",
          "PURWOKERTO_KIDUL",
          "KARANGPUCUNG"
        )
        .allow(""),
    });

    const convertedQuery = {
      search: req.query.search ? req.query.search.toUpperCase() : undefined,
      alamat: req.query.alamat ? req.query.alamat.toUpperCase() : undefined,
    };

    const { error } = queryValidationSchema.validate(convertedQuery);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    if (req.query.search) {
      const { search } = req.query;
      getUsers = await prisma.user.findMany({
        where: {
          AND: {
            role: "PENJUAL",
          },
          OR: [
            {
              nama: {
                contains: search || "",
                mode: "insensitive",
              },
            },
            {
              alamat: {
                contains: search || "",
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          nama: true,
          alamat: true,
          role: true,
          media: true,
        },
      });
    } else if (req.query.alamat) {
      const { alamat } = req.query;
      getUsers = await prisma.user.findMany({
        where: {
          AND: {
            alamat: alamat.toUpperCase(),
            role: "PENJUAL",
          },
        },
        select: {
          id: true,
          nama: true,
          alamat: true,
          role: true,
          media: true,
        },
      });
    } else {
      getUsers = await prisma.user.findMany({
        where: {
          AND: {
            role: "PENJUAL",
          },
        },
        select: {
          id: true,
          nama: true,
          alamat: true,
          role: true,
          media: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "OK!",
      err: null,
      data: getUsers,
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
  getAll,
  checkAdmin,
  checkAdminPenjual,
  checkPembeli,
};

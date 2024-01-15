const prisma = require("../libs/prisma");
const { produkValidationSchema, produkUpdateValidationSchema } = require("../validations/produk.validation");
const imagekit = require("../libs/imagekit");
const path = require("path");

const createTransaksi = async (req, res, next) => {
  try {
    const { value, error } = produkValidationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const { nama, deskripsi, harga, satuan, stok, kategori } = value;

    const createProduk = await prisma.produk.create({
      data: {
        nama,
        deskripsi,
        harga,
        satuan,
        stok,
        kategori,
      },
    });

    // fungsi uploadFiles untuk imagekit
    const uploadFiles = async (files, id_produk) => {
      try {
        const gambarPromises = files.map(async (file) => {
          let strFile = file.buffer.toString("base64");

          let { url, fileId } = await imagekit.upload({
            fileName: Date.now() + path.extname(file.originalname),
            file: strFile,
          });

          const gambar = await prisma.media.create({
            data: {
              id_link: fileId,
              link: url,
              id_produk: id_produk,
            },
          });

          return gambar;
        });

        return Promise.all(gambarPromises);
      } catch (err) {
        return res.status(404).json({
          status: false,
          message: "Bad Request!",
          err: err.message,
          data: null,
        });
      }
    };

    await uploadFiles(req.files, createProduk.id);

    return res.status(201).json({
      status: true,
      message: "Produk berhasil dibuat",
      err: null,
      data: createProduk,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const getAll = async (req, res, next) => {
  try {
    const produk = await prisma.produk.findMany({
      include: {
        media: true,
      },
      orderBy: {
        created: "desc",
      },
    });

    return res.status(200).json({
      status: false,
      message: "OK!",
      err: null,
      data: produk,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const produkById = await prisma.produk.findUnique({
      where: { id: parseInt(id) },
      include: {
        media: true,
      },
    });

    if (!produkById) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Produk tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Produk retrieved successfully",
      err: null,
      data: produkById,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const updateTransaksi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, error } = produkUpdateValidationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const { nama, deskripsi, harga, satuan, stok, kategori } = value;

    const checkProduk = await prisma.produk.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!checkProduk) {
      return res.status(404).json({
        status: false,
        message: "Bad Request",
        err: "Produk tidak ditemukan",
        data: null,
      });
    }

    const updateProduk = await prisma.produk.update({
      where: {
        id: Number(id),
      },
      data: {
        nama,
        deskripsi,
        harga: harga ? Number(harga) : checkProduk.harga,
        satuan,
        stok: stok ? Number(stok) : checkProduk.stok,
        kategori,
      },
    });

    return res.status(201).json({
      status: true,
      message: "Produk berhasil dibuat",
      err: null,
      data: updateProduk,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

const deleteTransaksi = async (req, res, next) => {
  try {
    const { id } = req.params;

    const produk = await prisma.produk.findUnique({
      where: { id: parseInt(id) },
    });

    if (!produk) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: err.message,
        data: null,
      });
    }

    const media = await prisma.media.findMany({
      where: {
        id_produk: Number(id),
      },
    });

    // delete gambar di imagekit
    const deleteGambar = async (gambar) => {
      try {
        const gambarPromises = gambar.map(async (g) => {
          if (g.id_link !== "-") {
            await imagekit.deleteFile(g.id_link);
          }
        });

        return Promise.all(gambarPromises);
      } catch (err) {
        throw err;
      }
    };

    await deleteGambar(media);
    await prisma.media.deleteMany({
      where: {
        id_artikel: Number(id),
      },
    });

    await prisma.produk.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      status: true,
      message: "Produk deleted successfully",
      err: null,
      data: null,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: "Bad Request",
      err: err.message,
      data: null,
    });
  }
};

module.exports = {
  createTransaksi,
  getAll,
  getById,
  updateTransaksi,
  deleteTransaksi,
};

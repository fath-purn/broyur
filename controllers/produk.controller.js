const prisma = require("../libs/prisma");
const { produkValidationSchema } = require("../validations/produk.validation");
const imagekit = require("../libs/imagekit");
const path = require("path");

const createProduk = async (req, res, next) => {
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

          console.log(url, fileId, "adfas");

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
      const warung = await prisma.produk.findMany({
        // select: {
        //   id: true,
        //   nama: true,
        //   harga: true,
        //   deskripsi: true,
        //   kuantiti: true,
        //   stok: true,
        //   user: {
        //     select: {
        //       id: true,
        //       fullname: true,
        //       no_wa: true,
        //     },
        //   },
        //   pengujian: {
        //     select: {
        //       id: true,
        //       hasil: true,
        //     },
        //   },
        //   Media: {
        //     select: {
        //       id: true,
        //       link: true,
        //     },
        //   },
        //   created: true,
        //   updated: true,
        // },
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
        data: warung,
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
      const warungById = await prisma.warung.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          nama: true,
          harga: true,
          deskripsi: true,
          kuantiti: true,
          stok: true,
          user: {
            select: {
              id: true,
              fullname: true,
              no_wa: true,
            },
          },
          pengujian: {
              select: {
                  id: true,
                  hasil: true,
              },
          },
          Media: {
            select: {
              id: true,
              link: true,
            },
          },
          created: true,
          updated: true,
        },
      });
  
      if (!warungById) {
        return res.status(400).json({
          status: false,
          message: "Bad Request!",
          err: "Warung tidak ditemukan",
          data: null,
        });
      }
  
      return res.status(200).json({
        status: true,
        message: "Warung retrieved successfully",
        err: null,
        data: warungById,
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
  createProduk,
  getAll,
  getById
};

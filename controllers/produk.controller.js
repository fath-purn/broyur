const prisma = require("../libs/prisma");
const {
  produkValidationSchema,
  produkUpdateValidationSchema,
} = require("../validations/produk.validation");
const imagekit = require("../libs/imagekit");
const path = require("path");
const Joi = require('joi');

const createProduk = async (req, res, next) => {
  try {
    const { user } = req;
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
        id_user: user.id,
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
    let produk = null;

    const queryValidationSchema = Joi.object({
      search: Joi.string().allow(''),
      alamat: Joi.string().valid('TELUK', 'BERKOH', 'TANJUNG', 'KARANGKLESEM', 'PURWOKERTO_KIDUL', 'KARANGPUCUNG').allow(''),
      kategori: Joi.string().valid('SAYUR', 'DAGING_DAN_IKAN', 'BUAH', 'TELUR_TAHU_TEMPE').allow(''),
    });
    
    const convertedQuery = {
      search: req.query.search ? req.query.search.toUpperCase() : undefined,
      alamat: req.query.alamat ? req.query.alamat.toUpperCase() : undefined,
      kategori: req.query.kategori ? req.query.kategori.toUpperCase() : undefined,
    };
    
    const { error } = queryValidationSchema.validate(convertedQuery);    

    if (error) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    if (req.query.search) {
      const { search } = req.query;
      produk = await prisma.produk.findMany({
        where: {
          nama: {
            contains: search,
            mode: "insensitive",
          },
        },
        include: {
          media: true,
          user: {
            select: {
              id: true,
              nama: true,
              email: true,
              role: true,
              created: true,
              updated: true,
            }
          },
        },
        orderBy: {
          created: "desc",
        },
      });
    } else if (req.query.alamat && req.query.kategori) {
      const { alamat, kategori } = req.query;
      produk = await prisma.produk.findMany({
        where: {
          kategori: kategori.toUpperCase(),
          user: {
            alamat: alamat.toUpperCase(),
          },
        },
        include: {
          media: true,
          user: {
            select: {
              id: true,
              nama: true,
              email: true,
              role: true,
              created: true,
              updated: true,
            }
          },
        },
        orderBy: {
          created: "desc",
        },
      });
    } else if (req.query.kategori) {
      const { kategori } = req.query;
      produk = await prisma.produk.findMany({
        where: {
          kategori: kategori.toUpperCase(),
        },
        include: {
          media: true,
          user: {
            select: {
              id: true,
              nama: true,
              email: true,
              role: true,
              created: true,
              updated: true,
            }
          },
        },
        orderBy: {
          created: "desc",
        },
      });
    } else if (req.query.alamat) {
      const { alamat } = req.query;
      produk = await prisma.produk.findMany({
        where: {
          user: {
            alamat: alamat.toUpperCase(),
          },
        },
        include: {
          media: true,
          user: {
            select: {
              id: true,
              nama: true,
              email: true,
              role: true,
              created: true,
              updated: true,
            }
          },
        },
        orderBy: {
          created: "desc",
        },
      });
    } else {
      produk = await prisma.produk.findMany({
        include: {
          media: true,
          user: {
            select: {
              id: true,
              nama: true,
              email: true,
              role: true,
              created: true,
              updated: true,
            }
          },
        },
        orderBy: {
          created: "desc",
        },
      });
    }

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

const getAllPenjual = async (req, res, next) => {
  try {
    const { user } = req;
    
    let produk = null;

    const queryValidationSchema = Joi.object({
      search: Joi.string().allow(''),
      alamat: Joi.string().valid('TELUK', 'BERKOH', 'TANJUNG', 'KARANGKLESEM', 'PURWOKERTO_KIDUL', 'KARANGPUCUNG').allow(''),
      kategori: Joi.string().valid('SAYUR', 'DAGING_DAN_IKAN', 'BUAH', 'TELUR_TAHU_TEMPE').allow(''),
    });
    
    const convertedQuery = {
      search: req.query.search ? req.query.search.toUpperCase() : undefined,
      alamat: req.query.alamat ? req.query.alamat.toUpperCase() : undefined,
      kategori: req.query.kategori ? req.query.kategori.toUpperCase() : undefined,
    };
    
    const { error } = queryValidationSchema.validate(convertedQuery);    

    if (error) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    if (req.query.search) {
      const { search } = req.query;
      produk = await prisma.produk.findMany({
        where: {
          id_user: user.id,
          nama: {
            contains: search,
            mode: "insensitive",
          },
        },
        include: {
          media: true,
          user: {
            select: {
              id: true,
              nama: true,
              email: true,
              role: true,
              created: true,
              updated: true,
            }
          },
        },
        orderBy: {
          created: "desc",
        },
      });
    } else if (req.query.alamat && req.query.kategori) {
      const { alamat, kategori } = req.query;
      produk = await prisma.produk.findMany({
        where: {
          id_user: user.id,
          kategori: kategori.toUpperCase(),
          user: {
            alamat: alamat.toUpperCase(),
          },
        },
        include: {
          media: true,
          user: {
            select: {
              id: true,
              nama: true,
              email: true,
              role: true,
              created: true,
              updated: true,
            }
          },
        },
        orderBy: {
          created: "desc",
        },
      });
    } else if (req.query.kategori) {
      const { kategori } = req.query;
      produk = await prisma.produk.findMany({
        where: {
          id_user: user.id,
          kategori: kategori.toUpperCase(),
        },
        include: {
          media: true,
          user: {
            select: {
              id: true,
              nama: true,
              email: true,
              role: true,
              created: true,
              updated: true,
            }
          },
        },
        orderBy: {
          created: "desc",
        },
      });
    } else if (req.query.alamat) {
      const { alamat } = req.query;
      produk = await prisma.produk.findMany({
        where: {
          id_user: user.id,
          user: {
            alamat: alamat.toUpperCase(),
          },
        },
        include: {
          media: true,
          user: {
            select: {
              id: true,
              nama: true,
              email: true,
              role: true,
              created: true,
              updated: true,
            }
          },
        },
        orderBy: {
          created: "desc",
        },
      });
    } else {
      produk = await prisma.produk.findMany({
        where: { id_user: user.id },
        include: {
          media: true,
          user: {
            select: {
              id: true,
              nama: true,
              email: true,
              role: true,
              created: true,
              updated: true,
            }
          },
        },
        orderBy: {
          created: "desc",
        },
      });
    }

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

const getByIdPenjual = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const produkById = await prisma.produk.findUnique({
      where: { id: parseInt(id), id_user: user.id },
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

const updateProduk = async (req, res, next) => {
  try {
    const { user } = req;
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
        id_user: user.id,
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
        id_user: user.id,
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

const deleteProduk = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;

    const produk = await prisma.produk.findUnique({
      where: {
        id: parseInt(id),
        id_user: user.id,
      },
    });

    if (!produk) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Produk tidak ditemukan",
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
        id_produk: Number(id),
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
  createProduk,
  getAll,
  getById,
  updateProduk,
  deleteProduk,
  getAllPenjual,
  getByIdPenjual,
};

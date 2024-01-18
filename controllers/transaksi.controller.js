const prisma = require('../libs/prisma');
const { transaksiValidationSchema, transaksiUpdateValidationSchema, validateTransactionValidationSchema } = require('../validations/transaksi.validation');
const Joi = require('joi');

const createTransaksi = async (req, res, next) => {
  try {
    const { user } = req;
    const { value, error } = transaksiValidationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    const isExistProducts = await prisma.produk.findMany({
      where: {
        id: {
          in: value.map((item) => item.id_produk),
        },
      },
    });

    if (isExistProducts.length !== value.length) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: 'Produk tidak ditemukan',
        data: null,
      });
    }

    // check stok
    const checkStok = await Promise.all(
      value.map(async (item) => {
        const checkProduk = await prisma.produk.findUnique({
          where: {
            id: Number(item.id_produk),
          },
        });

        if (checkProduk.stok < item.jumlah) {
          return false;
        }

        return true;
      })
    );

    if (checkStok.includes(false)) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: 'Stok tidak cukup',
        data: null,
      });
    }

    // descrese stok
    await Promise.all(
      value.map(async (item) => {
        const checkProduk = await prisma.produk.findUnique({
          where: {
            id: Number(item.id_produk),
          },
        });

        const stokBaru = checkProduk.stok - item.jumlah;

        await prisma.produk.update({
          where: {
            id: Number(item.id_produk),
          },
          data: {
            stok: stokBaru,
          },
        });
      })
    );

    const transactions = await prisma.transaksi.createMany({
      data: value.map((item) => ({
        id_user: Number(user.id),
        id_produk: Number(item.id_produk),
        harga: isExistProducts.find((val) => val.id === item.id_produk).harga * Number(item.jumlah),
        jumlah: item.jumlah,
        alamat: item.alamat,
        pembayaran: item.pembayaran,
      })),
    });

    return res.status(201).json({
      status: true,
      message: 'Transaksi berhasil dibuat',
      err: null,
      data: transactions,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: 'Bad Request',
      err: err.message,
      data: null,
    });
  }
};

const getAll = async (req, res, next) => {
  try {
    const { user } = req;
    let transaksi = null;

    const statusValidationSchema = Joi.object({
      status: Joi.string().valid('SELESAI', 'MENUNGGU', 'DITOLAK', 'DIPROSES', 'DIKONFIRMASI').allow(''),
    });

    const convertedQuery = {
      status: req.query.status ? req.query.status.toUpperCase() : undefined,
    };

    const { error } = statusValidationSchema.validate(convertedQuery);

    if (error) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    if (req.query.status) {
      const { status } = req.query;
      transaksi = await prisma.transaksi.findMany({
        where: {
          id_user: user.id,
          status: status.toUpperCase(),
        },
        include: {
          produk: {
            include: {
              media: true,
            },
          },
        },
        orderBy: {
          created: 'desc',
        },
      });
    } else {
      transaksi = await prisma.transaksi.findMany({
        where: {
          OR: [
            {
              id_user: user.id,
            },
            {
              produk: {
                id_user: user.id,
              },
            },
          ],
        },
        include: {
          produk: {
            include: {
              media: true,
            },
          },
        },
        orderBy: {
          created: 'desc',
        },
      });
    }

    return res.status(200).json({
      status: false,
      message: 'OK!',
      err: null,
      data: transaksi,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: 'Bad Request',
      err: err.message,
      data: null,
    });
  }
};

const getById = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;

    const transaksiById = await prisma.transaksi.findUnique({
      where: {
        id: parseInt(id),
        id_user: user.id,
      },
      include: {
        produk: {
          include: {
            media: true,
          },
        },
      },
    });

    if (!transaksiById) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request!',
        err: 'Transaksi tidak ditemukan',
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Transaksi berhasil dibuat',
      err: null,
      data: transaksiById,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: 'Bad Request',
      err: err.message,
      data: null,
    });
  }
};

const updateTransaksi = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const { value, error } = transaksiUpdateValidationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    const { jumlah, alamat, pembayaran, status } = value;

    const checkTransaksi = await prisma.transaksi.findUnique({
      where: {
        id: Number(id),
        id_user: user.id,
      },
    });

    if (!checkTransaksi) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: 'Transaksi tidak ditemukan',
        data: null,
      });
    }

    const checkProduk = await prisma.produk.findUnique({
      where: {
        id: Number(checkTransaksi.id_produk),
      },
    });

    if (!checkProduk) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: 'Produk tidak ditemukan',
        data: null,
      });
    }

    if (jumlah <= 0) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: 'Jumlah produk tidak mencukupi',
        data: null,
      });
    }

    if (jumlah) {
      let stokBaru = null;

      if (jumlah < checkTransaksi.jumlah) {
        stokBaru = checkProduk.stok + (checkTransaksi.jumlah - jumlah);
      }

      if (jumlah > checkTransaksi.jumlah) {
        stokBaru = checkProduk.stok + (checkTransaksi.jumlah - jumlah);
      }

      if (jumlah === checkTransaksi.jumlah) {
        stokBaru = checkTransaksi.stok;
      }

      if (stokBaru < 0) {
        return res.status(400).json({
          status: false,
          message: 'Bad Request',
          err: 'Stok tidak cukup',
          data: null,
        });
      }

      await prisma.produk.update({
        where: {
          id: Number(checkTransaksi.id_produk),
        },
        data: {
          stok: stokBaru,
        },
      });
    }

    let harga = null;

    if (jumlah) {
      harga = checkProduk.harga * Number(jumlah);
    }

    const updateTransaksi = await prisma.transaksi.update({
      where: {
        id: Number(id),
      },
      data: {
        jumlah: jumlah ? jumlah : checkTransaksi.jumlah,
        harga: jumlah ? harga : checkTransaksi.harga,
        alamat,
        pembayaran,
        status,
      },
    });

    return res.status(201).json({
      status: true,
      message: 'Transaksi berhasil di update',
      err: null,
      data: updateTransaksi,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: 'Bad Request',
      err: err.message,
      data: null,
    });
  }
};

const deleteTransaksi = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;

    const transaksi = await prisma.transaksi.findUnique({
      where: { id: Number(id), id_user: user.id },
    });

    if (!transaksi) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request!',
        err: 'Transaksi tidak ditemukan',
        data: null,
      });
    }

    const checkProduk = await prisma.produk.findUnique({
      where: {
        id: Number(transaksi.id_produk),
      },
    });

    await prisma.produk.update({
      where: { id: Number(transaksi.id_produk) },
      data: {
        stok: checkProduk.stok + transaksi.jumlah,
      },
    });

    await prisma.transaksi.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      status: true,
      message: 'Produk deleted successfully',
      err: null,
      data: null,
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: 'Bad Request',
      err: err.message,
      data: null,
    });
  }
};

const validateTransaksi = async (req, res, next) => {
  try {
    const { value, error } = validateTransactionValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    const { id } = req.params;
    const { status, note } = value;

    const checkTransaksi = await prisma.transaksi.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!checkTransaksi) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: 'Transaksi tidak ditemukan',
        data: null,
      });
    }

    const updateTransaksi = await prisma.transaksi.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
        note,
      },
    });

    return res.status(201).json({
      status: true,
      message: 'Transaksi berhasil di update',
      err: null,
      data: updateTransaksi,
    });
  } catch (error) {
    next(error);
  }
};

const myTransaction = async (req, res, next) => {
  try {
    const { user } = req;
    let transaksi = null;

    const checkRole = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (req.query.status) {
      const { status } = req.query;
      if (checkRole.role === 'PEMBELI') {
        transaksi = await prisma.transaksi.findMany({
          where: {
            id_user: user.id,
            status: status.toUpperCase(),
          },
          include: {
            produk: {
              include: {
                media: true,
              },
            },
            user: {
              select: {
                nama: true,
              },
            },
          },
          orderBy: {
            created: 'desc',
          },
        });
      } else if (checkRole.role === 'PENJUAL') {
        transaksi = await prisma.transaksi.findMany({
          where: {
            produk: {
              id_user: user.id,
            },
            status: status.toUpperCase(),
          },
          include: {
            produk: {
              include: {
                media: true,
              },
            },
            user: {
              select: {
                nama: true,
              },
            },
          },
          orderBy: {
            created: 'desc',
          },
        });
      }
    } else {
      if (checkRole.role === 'PEMBELI') {
        transaksi = await prisma.transaksi.findMany({
          where: {
            id_user: user.id,
          },
          include: {
            produk: {
              include: {
                media: true,
              },
            },
            user: {
              select: {
                nama: true,
              },
            },
          },
          orderBy: {
            created: 'desc',
          },
        });
      } else if (checkRole.role === 'PENJUAL') {
        transaksi = await prisma.transaksi.findMany({
          where: {
            produk: {
              id_user: user.id,
            },
          },
          include: {
            produk: {
              include: {
                media: true,
              },
            },
            user: {
              select: {
                nama: true,
              },
            },
          },
          orderBy: {
            created: 'desc',
          },
        });
      } else {
        transaksi = await prisma.transaksi.findMany({
          where: {
            id_user: user.id,
          },
          include: {
            produk: {
              include: {
                media: true,
              },
            },
            user: {
              select: {
                nama: true,
              },
            },
          },
          orderBy: {
            created: 'desc',
          },
        });
      }
    }

    return res.status(200).json({
      status: false,
      message: 'OK!',
      err: null,
      data: transaksi.map((t) => {
        return {
          ...t,
          jam: '08.00 - 08.15',
          bukti_pembayaran: null,
        };
      }),
    });
  } catch (err) {
    next(err);
    return res.status(400).json({
      status: false,
      message: 'Bad Request',
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
  validateTransaksi,
  myTransaction,
};

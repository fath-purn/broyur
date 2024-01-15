const prisma = require("../libs/prisma");
const {
  transaksiValidationSchema,
  transaksiUpdateValidationSchema,
} = require("../validations/transaksi.validation");

const createTransaksi = async (req, res, next) => {
  try {
    const { user } = req;
    const { value, error } = transaksiValidationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const { id_produk, jumlah, alamat, pembayaran, status } = value;

    const checkProduk = await prisma.produk.findUnique({
      where: {
        id: Number(id_produk),
      },
    });

    if (!checkProduk) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: "Produk tidak ditemukan",
        data: null,
      });
    }

    if (checkProduk.stok < jumlah) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: "Stok tidak cukup",
        data: null,
      });
    }

    let stokBaru = checkProduk.stok - jumlah;

    await prisma.produk.update({
      where: {
        id: Number(id_produk),
      },
      data: {
        stok: stokBaru,
      },
    });

    let harga = checkProduk.harga * Number(jumlah);

    const checkTransaksi = await prisma.transaksi.findFirst({
      where: {
        id_produk: id_produk,
        id_user: user.id,
      }
    });

    if(checkTransaksi) {
      const updateTransaksi = await prisma.transaksi.update({
        where: {
          id: checkTransaksi.id,
        },
        data: {
          jumlah: checkTransaksi.jumlah + jumlah,
        }
      });

      return res.status(201).json({
        status: true,
        message: "Transaksi berhasil dibuat mang ea",
        err: null,
        data: updateTransaksi,
      });

    }

    const createTransaksi = await prisma.transaksi.create({
      data: {
        id_user: Number(user.id),
        id_produk: Number(id_produk),
        jumlah,
        harga: harga,
        alamat,
        pembayaran,
        status,
      },
    });

    return res.status(201).json({
      status: true,
      message: "Transaksi berhasil dibuat",
      err: null,
      data: createTransaksi,
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
    const { user } = req;
    
    const transaksi = await prisma.transaksi.findMany({
      where: {
        id_user: user.id,
      },
      include: {
        produk: {
          include: {
            media: true,
          },
        },
      },
      orderBy: {
        created: "desc",
      },
    });

    return res.status(200).json({
      status: false,
      message: "OK!",
      err: null,
      data: transaksi,
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
          }
        }
      }
    });

    if (!transaksiById) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Transaksi tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Transaksi berhasil dibuat",
      err: null,
      data: transaksiById,
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
    const { user } = req;
    const { id } = req.params;
    const { value, error } = transaksiUpdateValidationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
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
        message: "Bad Request",
        err: "Transaksi tidak ditemukan",
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
        message: "Bad Request",
        err: "Produk tidak ditemukan",
        data: null,
      });
    }

    if (jumlah <= 0) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        err: "Jumlah produk tidak mencukupi",
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
          message: "Bad Request",
          err: "Stok tidak cukup",
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
      message: "Transaksi berhasil di update",
      err: null,
      data: updateTransaksi,
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
    const { user } = req;
    const { id } = req.params;

    const transaksi = await prisma.transaksi.findUnique({
      where: { id: Number(id), id_user: user.id },
    });

    if (!transaksi) {
      return res.status(400).json({
        status: false,
        message: "Bad Request!",
        err: "Transaksi tidak ditemukan",
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

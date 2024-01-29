const prisma = require('../libs/prisma');
const { cartValidationSchema, addToCartValidationSchema } = require('../validations/cart.validation');

const addToCart = async (req, res, next) => {
  const { id } = req.params;
  const { id: userId } = req.user;
  const { jumlah } = req.body;

  try {
    const { error } = await addToCartValidationSchema.validateAsync(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const isExist = await prisma.cart.findFirst({
      where: {
        id_produk: Number(id),
        id_user: Number(userId),
      },
    });

    if (isExist) {
      return res.status(400).json({
        success: false,
        message: 'Produk sudah ada di keranjang',
      });
    }

    const cart = await prisma.cart.create({
      data: {
        jumlah,
        user: {
          connect: {
            id: Number(userId),
          },
        },
        produk: {
          connect: {
            id: Number(id),
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Berhasil menambahkan produk ke keranjang',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  const { id: userId } = req.user;

  try {
    const {cart} = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      select: {
        cart: {
          select: {
            id: true,
            jumlah: true,
            produk: {
              select: {
                id: true,
                nama: true,
                harga: true,
                media: {
                  select: {
                    link: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Berhasil mendapatkan data keranjang',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,
  getCart,
};

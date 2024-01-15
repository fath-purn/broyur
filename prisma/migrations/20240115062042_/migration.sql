-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PENJUAL', 'PEMBELI');

-- CreateEnum
CREATE TYPE "Kategori" AS ENUM ('SAYUR', 'DAGING_DAN_IKAN', 'BUAH', 'TELUR_TAHU_TEMPE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('SELESAI', 'MENUNGGU', 'DITOLAK', 'DIPROSES', 'DIKONFIRMASI');

-- CreateEnum
CREATE TYPE "Pembayaran" AS ENUM ('CASH', 'TRANSFER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produk" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,
    "satuan" TEXT NOT NULL,
    "stok" INTEGER NOT NULL,
    "kategori" "Kategori" NOT NULL,

    CONSTRAINT "Produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_link" TEXT NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,
    "alamat" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "pembayaran" "Pembayaran" NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "Produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "Produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

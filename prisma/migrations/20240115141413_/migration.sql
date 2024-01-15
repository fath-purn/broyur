/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PENJUAL', 'PEMBELI');

-- CreateEnum
CREATE TYPE "Kategori" AS ENUM ('SAYUR', 'DAGING_DAN_IKAN', 'BUAH', 'TELUR_TAHU_TEMPE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('SELESAI', 'MENUNGGU', 'DITOLAK', 'DIPROSES', 'DIKONFIRMASI');

-- CreateEnum
CREATE TYPE "Pembayaran" AS ENUM ('CASH', 'TRANSFER');

-- CreateEnum
CREATE TYPE "Alamat" AS ENUM ('TELUK', 'BERKOH', 'TANJUNG', 'KARANGKLESEM', 'PURWOKERTO_KIDUL', 'KARANGPUCUNG');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "alamat" "Alamat",
ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL,
ADD COLUMN     "updated" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Produk" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,
    "satuan" TEXT NOT NULL,
    "stok" INTEGER NOT NULL,
    "kategori" "Kategori" NOT NULL,
    "id_user" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "id_produk" INTEGER,
    "id_user" INTEGER,
    "id_link" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

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
    "status" "Status" NOT NULL DEFAULT 'DIPROSES',
    "pembayaran" "Pembayaran" NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Produk" ADD CONSTRAINT "Produk_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "Produk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "Produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `alamat` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `created` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updated` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Produk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaksi` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_id_produk_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_id_user_fkey";

-- DropForeignKey
ALTER TABLE "Produk" DROP CONSTRAINT "Produk_id_user_fkey";

-- DropForeignKey
ALTER TABLE "Transaksi" DROP CONSTRAINT "Transaksi_id_produk_fkey";

-- DropForeignKey
ALTER TABLE "Transaksi" DROP CONSTRAINT "Transaksi_id_user_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "alamat",
DROP COLUMN "created",
DROP COLUMN "password",
DROP COLUMN "role",
DROP COLUMN "updated";

-- DropTable
DROP TABLE "Media";

-- DropTable
DROP TABLE "Produk";

-- DropTable
DROP TABLE "Transaksi";

-- DropEnum
DROP TYPE "Alamat";

-- DropEnum
DROP TYPE "Kategori";

-- DropEnum
DROP TYPE "Pembayaran";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "Status";

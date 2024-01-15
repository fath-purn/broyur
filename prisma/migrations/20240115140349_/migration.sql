/*
  Warnings:

  - The `alamat` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Alamat" AS ENUM ('Teluk', 'Berkoh', 'Tanjung', 'Karangklesem', 'Purwokerto_kidul', 'Karangpucung');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "alamat",
ADD COLUMN     "alamat" "Alamat";

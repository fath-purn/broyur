/*
  Warnings:

  - The values [Teluk,Berkoh,Tanjung,Karangklesem,Purwokerto_kidul,Karangpucung] on the enum `Alamat` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Alamat_new" AS ENUM ('TELUK', 'BERKOH', 'TANJUNG', 'KARANGKLESEM', 'PURWOKERTO_KIDUL', 'KARANGPUCUNG');
ALTER TABLE "User" ALTER COLUMN "alamat" TYPE "Alamat_new" USING ("alamat"::text::"Alamat_new");
ALTER TYPE "Alamat" RENAME TO "Alamat_old";
ALTER TYPE "Alamat_new" RENAME TO "Alamat";
DROP TYPE "Alamat_old";
COMMIT;

/*
  Warnings:

  - You are about to drop the column `addressId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_user]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_user` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_addressId_fkey`;

-- DropIndex
DROP INDEX `User_addressId_fkey` ON `User`;

-- AlterTable
ALTER TABLE `Address` ADD COLUMN `id_user` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `addressId`;

-- CreateIndex
CREATE UNIQUE INDEX `Address_id_user_key` ON `Address`(`id_user`);

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to alter the column `lastName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `firstName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `phone` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `siretNumber` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(14)`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `lastName` VARCHAR(50) NOT NULL,
    MODIFY `firstName` VARCHAR(50) NOT NULL,
    MODIFY `phone` VARCHAR(20) NOT NULL,
    MODIFY `siretNumber` VARCHAR(14) NOT NULL;

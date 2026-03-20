/*
  Warnings:

  - You are about to drop the column `maps` on the `Address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Address` DROP COLUMN `maps`,
    ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL;

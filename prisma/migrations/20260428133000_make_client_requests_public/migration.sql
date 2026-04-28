-- Add columns to store public client contact details directly on Event
ALTER TABLE `Event`
    ADD COLUMN `clientFirstName` VARCHAR(191) NULL,
    ADD COLUMN `clientLastName` VARCHAR(191) NULL,
    ADD COLUMN `clientEmail` VARCHAR(191) NULL,
    ADD COLUMN `clientPhone` VARCHAR(191) NULL;

-- Preserve any existing linked client data when possible
UPDATE `Event`
INNER JOIN `User` ON `Event`.`clientId` = `User`.`id_user`
SET
    `Event`.`clientFirstName` = `User`.`firstName`,
    `Event`.`clientLastName` = `User`.`lastName`,
    `Event`.`clientEmail` = `User`.`mail`,
    `Event`.`clientPhone` = `User`.`phone`
WHERE `Event`.`clientId` IS NOT NULL;

-- Remove the obsolete client/user relation
ALTER TABLE `Event` DROP FOREIGN KEY `Event_clientId_fkey`;
DROP INDEX `Event_clientId_idx` ON `Event`;
ALTER TABLE `Event` DROP COLUMN `clientId`;

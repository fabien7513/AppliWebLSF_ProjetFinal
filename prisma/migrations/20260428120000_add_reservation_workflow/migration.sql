/*
  Cette migration suppose que la table Event n'est pas encore utilisée
  par des données métier critiques, car le flux de réservation n'était
  pas encore branché dans l'application.
*/

-- AlterTable
ALTER TABLE `User`
    ADD COLUMN `role` ENUM('CLIENT', 'INTERPRETER') NOT NULL DEFAULT 'INTERPRETER',
    MODIFY `siretNumber` VARCHAR(14) NULL;

-- AlterTable
ALTER TABLE `Event`
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `message` VARCHAR(191) NULL,
    ADD COLUMN `clientId` INTEGER NOT NULL,
    ADD COLUMN `interpreterId` INTEGER NOT NULL,
    MODIFY `interventionType` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Event_clientId_idx` ON `Event`(`clientId`);

-- CreateIndex
CREATE INDEX `Event_interpreterId_idx` ON `Event`(`interpreterId`);

-- AddForeignKey
ALTER TABLE `Event`
    ADD CONSTRAINT `Event_clientId_fkey`
    FOREIGN KEY (`clientId`) REFERENCES `User`(`id_user`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event`
    ADD CONSTRAINT `Event_interpreterId_fkey`
    FOREIGN KEY (`interpreterId`) REFERENCES `User`(`id_user`)
    ON DELETE CASCADE ON UPDATE CASCADE;

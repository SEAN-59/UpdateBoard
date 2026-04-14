-- CreateTable
CREATE TABLE `App` (
    `bundleId` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `platform` ENUM('ios', 'android', 'web', 'desktop') NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`bundleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppVersion` (
    `id` CHAR(36) NOT NULL,
    `bundleId` VARCHAR(100) NOT NULL,
    `mode` ENUM('debug', 'release') NOT NULL,
    `version` VARCHAR(50) NOT NULL,
    `releaseNote` TEXT NOT NULL,
    `forceUpdate` BOOLEAN NOT NULL DEFAULT false,
    `isLatest` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AppVersion_bundleId_mode_idx`(`bundleId`, `mode`),
    INDEX `AppVersion_bundleId_mode_isLatest_idx`(`bundleId`, `mode`, `isLatest`),
    INDEX `AppVersion_bundleId_mode_forceUpdate_idx`(`bundleId`, `mode`, `forceUpdate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApiKey` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `bundleId` VARCHAR(100) NULL,
    `tokenPrefix` VARCHAR(32) NOT NULL,
    `tokenHash` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastUsedAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,

    INDEX `ApiKey_bundleId_idx`(`bundleId`),
    INDEX `ApiKey_tokenPrefix_idx`(`tokenPrefix`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AppVersion` ADD CONSTRAINT `AppVersion_bundleId_fkey` FOREIGN KEY (`bundleId`) REFERENCES `App`(`bundleId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApiKey` ADD CONSTRAINT `ApiKey_bundleId_fkey` FOREIGN KEY (`bundleId`) REFERENCES `App`(`bundleId`) ON DELETE CASCADE ON UPDATE CASCADE;

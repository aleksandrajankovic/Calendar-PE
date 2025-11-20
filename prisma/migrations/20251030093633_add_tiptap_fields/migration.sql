/*
  Warnings:

  - You are about to drop the column `description` on the `SpecialPromotion` table. All the data in the column will be lost.
  - You are about to drop the column `description1` on the `SpecialPromotion` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `SpecialPromotion` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `SpecialPromotion` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `WeeklyPromotion` table. All the data in the column will be lost.
  - You are about to drop the column `description1` on the `WeeklyPromotion` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `WeeklyPromotion` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `WeeklyPromotion` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpecialPromotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "button" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "rich" JSONB,
    "richHtml" TEXT
);
INSERT INTO "new_SpecialPromotion" ("active", "button", "day", "icon", "id", "link", "month", "title", "year") SELECT "active", "button", "day", "icon", "id", "link", "month", "title", "year" FROM "SpecialPromotion";
DROP TABLE "SpecialPromotion";
ALTER TABLE "new_SpecialPromotion" RENAME TO "SpecialPromotion";
CREATE TABLE "new_WeeklyPromotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekday" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "button" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "rich" JSONB,
    "richHtml" TEXT
);
INSERT INTO "new_WeeklyPromotion" ("active", "button", "icon", "id", "link", "title", "weekday") SELECT "active", "button", "icon", "id", "link", "title", "weekday" FROM "WeeklyPromotion";
DROP TABLE "WeeklyPromotion";
ALTER TABLE "new_WeeklyPromotion" RENAME TO "WeeklyPromotion";
CREATE UNIQUE INDEX "WeeklyPromotion_weekday_key" ON "WeeklyPromotion"("weekday");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

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
    "buttonColor" TEXT NOT NULL DEFAULT 'green',
    "rich" JSONB,
    "richHtml" TEXT
);
INSERT INTO "new_SpecialPromotion" ("active", "button", "day", "icon", "id", "link", "month", "rich", "richHtml", "title", "year") SELECT "active", "button", "day", "icon", "id", "link", "month", "rich", "richHtml", "title", "year" FROM "SpecialPromotion";
DROP TABLE "SpecialPromotion";
ALTER TABLE "new_SpecialPromotion" RENAME TO "SpecialPromotion";
CREATE TABLE "new_WeeklyPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "weekday" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "button" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "rich" JSONB,
    "richHtml" TEXT,
    "buttonColor" TEXT NOT NULL DEFAULT 'green'
);
INSERT INTO "new_WeeklyPlan" ("active", "button", "icon", "id", "link", "month", "rich", "richHtml", "title", "weekday", "year") SELECT "active", "button", "icon", "id", "link", "month", "rich", "richHtml", "title", "weekday", "year" FROM "WeeklyPlan";
DROP TABLE "WeeklyPlan";
ALTER TABLE "new_WeeklyPlan" RENAME TO "WeeklyPlan";
CREATE UNIQUE INDEX "WeeklyPlan_year_month_weekday_key" ON "WeeklyPlan"("year", "month", "weekday");
CREATE TABLE "new_WeeklyPromotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekday" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "button" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "buttonColor" TEXT NOT NULL DEFAULT 'green',
    "rich" JSONB,
    "richHtml" TEXT
);
INSERT INTO "new_WeeklyPromotion" ("active", "button", "icon", "id", "link", "rich", "richHtml", "title", "weekday") SELECT "active", "button", "icon", "id", "link", "rich", "richHtml", "title", "weekday" FROM "WeeklyPromotion";
DROP TABLE "WeeklyPromotion";
ALTER TABLE "new_WeeklyPromotion" RENAME TO "WeeklyPromotion";
CREATE UNIQUE INDEX "WeeklyPromotion_weekday_key" ON "WeeklyPromotion"("weekday");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

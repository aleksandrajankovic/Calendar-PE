-- CreateTable
CREATE TABLE "WeeklyPromotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekday" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT DEFAULT '',
    "image" TEXT DEFAULT '',
    "description" JSONB,
    "description1" JSONB,
    "link" TEXT NOT NULL,
    "button" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "SpecialPromotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image" TEXT,
    "link" TEXT NOT NULL,
    "button" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" JSONB,
    "description1" JSONB
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyPromotion_weekday_key" ON "WeeklyPromotion"("weekday");

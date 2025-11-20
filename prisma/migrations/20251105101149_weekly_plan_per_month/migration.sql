-- CreateTable
CREATE TABLE "WeeklyPlan" (
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
    "richHtml" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyPlan_year_month_weekday_key" ON "WeeklyPlan"("year", "month", "weekday");

-- Add calendar styling fields (non-destructive, nullable columns only)
ALTER TABLE "CalendarSettings" ADD COLUMN "monthBackgrounds" JSONB;
ALTER TABLE "CalendarSettings" ADD COLUMN "calendarPosition" TEXT;
ALTER TABLE "CalendarSettings" ADD COLUMN "calendarTitle" JSONB;
ALTER TABLE "CalendarSettings" ADD COLUMN "logoUrl" TEXT;

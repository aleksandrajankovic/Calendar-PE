-- Add theme and seoMeta to CalendarSettings (non-destructive, nullable columns only)
ALTER TABLE "CalendarSettings" ADD COLUMN "theme" TEXT;
ALTER TABLE "CalendarSettings" ADD COLUMN "seoMeta" JSONB;

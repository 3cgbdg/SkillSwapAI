-- Session scheduling: minute precision with timezone; drop global unique title

ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_title_key";

ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "startsAt" TIMESTAMP(3);
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "endsAt" TIMESTAMP(3);
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "timeZone" TEXT NOT NULL DEFAULT 'UTC';

UPDATE "Session"
SET
  "startsAt" = "date" + ("start" * INTERVAL '1 hour'),
  "endsAt" = CASE
    WHEN "end" = 0 THEN "date" + INTERVAL '1 day'
    ELSE "date" + ("end" * INTERVAL '1 hour')
  END
WHERE "startsAt" IS NULL;

ALTER TABLE "Session" ALTER COLUMN "startsAt" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "endsAt" SET NOT NULL;

ALTER TABLE "Session" DROP COLUMN IF EXISTS "start";
ALTER TABLE "Session" DROP COLUMN IF EXISTS "end";
ALTER TABLE "Session" DROP COLUMN IF EXISTS "date";

DROP INDEX IF EXISTS "Session_date_idx";
CREATE INDEX IF NOT EXISTS "Session_startsAt_idx" ON "Session"("startsAt");

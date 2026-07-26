-- Module.timeline: AI returns fractional weeks
ALTER TABLE "Module" ALTER COLUMN "timeline" TYPE DOUBLE PRECISION USING "timeline"::double precision;

-- Partial index for unread messages
CREATE INDEX IF NOT EXISTS "Message_toId_isSeen_unread_idx"
  ON "Message"("toId", "isSeen")
  WHERE "isSeen" = false;

-- Partial index for bot users (cron)
CREATE INDEX IF NOT EXISTS "User_isBot_true_idx"
  ON "User"("isBot")
  WHERE "isBot" = true;

-- Trigram search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "User_name_trgm_idx"
  ON "User" USING gin ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Skill_title_trgm_idx"
  ON "Skill" USING gin ("title" gin_trgm_ops);

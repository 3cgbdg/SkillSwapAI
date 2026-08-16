-- Restores the trigram search indexes originally added in
-- 20260726140000_resilience_indexes_timeline. Prisma's schema DSL (no
-- extendedIndexes/gin ops support configured here) can't represent GIN
-- trigram indexes, so `prisma migrate dev` doesn't see them as part of the
-- declared schema and drops them as "drift" the next time it runs. Recreate
-- them here and apply with `prisma migrate deploy` (not `migrate dev`) so
-- the diff engine doesn't immediately remove them again.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "User_name_trgm_idx"
  ON "User" USING gin ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Skill_title_trgm_idx"
  ON "Skill" USING gin ("title" gin_trgm_ops);

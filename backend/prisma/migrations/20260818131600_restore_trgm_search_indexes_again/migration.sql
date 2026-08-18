-- Restores the trigram search indexes again after `prisma migrate dev` in
-- 20260818131544_add_review_model dropped them as "drift" (same trap
-- documented in 20260815200000_restore_trgm_search_indexes -- Prisma's
-- schema DSL here can't represent GIN trigram indexes, so `migrate dev`
-- doesn't see them as part of the declared schema). Applied with
-- `prisma migrate deploy`, not `migrate dev`, so this doesn't immediately
-- get removed again.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "User_name_trgm_idx"
  ON "User" USING gin ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Skill_title_trgm_idx"
  ON "Skill" USING gin ("title" gin_trgm_ops);

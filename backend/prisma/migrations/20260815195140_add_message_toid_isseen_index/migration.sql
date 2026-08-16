/*
  Warnings:

  - You are about to drop the column `isBot` on the `Request` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Session_title_key";

-- DropIndex
DROP INDEX "Skill_title_trgm_idx";

-- DropIndex
DROP INDEX "User_name_trgm_idx";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "isBot";

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "Request_status_type_idx" ON "Request"("status", "type");

-- CreateIndex
CREATE INDEX "Session_startsAt_endsAt_idx" ON "Session"("startsAt", "endsAt");

-- RenameIndex
ALTER INDEX "Message_toId_isSeen_unread_idx" RENAME TO "Message_toId_isSeen_idx";

-- RenameIndex
ALTER INDEX "User_isBot_true_idx" RENAME TO "User_isBot_idx";

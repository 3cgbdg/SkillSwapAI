-- DropIndex
DROP INDEX "Skill_title_trgm_idx";

-- DropIndex
DROP INDEX "User_name_trgm_idx";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "reviewPromptedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_revieweeId_createdAt_idx" ON "Review"("revieweeId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_sessionId_idx" ON "Review"("sessionId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_sessionId_reviewerId_key" ON "Review"("sessionId", "reviewerId");

-- CreateIndex
CREATE INDEX "Session_status_endsAt_reviewPromptedAt_idx" ON "Session"("status", "endsAt", "reviewPromptedAt");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

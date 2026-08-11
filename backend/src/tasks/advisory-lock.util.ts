import { PrismaService } from 'prisma/prisma.service';

/** Stable advisory lock keys for cron jobs (must fit in bigint). */
export const CRON_LOCK_AUTO_ACCEPT_FRIENDS = 9_001_001n;
export const CRON_LOCK_AUTO_ACCEPT_SESSIONS = 9_001_002n;

export async function tryAcquireAdvisoryLock(
  prisma: PrismaService,
  lockId: bigint,
): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ acquired: boolean }[]>`
    SELECT pg_try_advisory_lock(${lockId}) AS acquired
  `;
  return rows[0]?.acquired === true;
}

export async function releaseAdvisoryLock(
  prisma: PrismaService,
  lockId: bigint,
): Promise<void> {
  await prisma.$executeRaw`SELECT pg_advisory_unlock(${lockId})`;
}

/**
 * Jest-only stub: the generated Prisma client is ESM (`import.meta`) and breaks Jest’s CJS runtime.
 * Unit tests here only need providers to construct; they do not hit the database.
 */

export class PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_opts?: any) {}

  $connect = async (): Promise<void> => {};

  $disconnect = async (): Promise<void> => {};
}

export type User = any;
export type Skill = any;
export type Plan = any;
export type Message = any;
export type Match = any;
export type Friendship = any;
export type ModuleStatus = any;
export type Session = any;
/** Prisma `Request` model (friend/session requests), not Express.Request */
export type Request = any;

export const Prisma: any = {};

import { Injectable, Logger } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerRequest,
} from '@nestjs/throttler';

/**
 * Rate limiting is not critical enough to take the whole API down with it.
 * The base ThrottlerGuard has no error handling around its Redis-backed
 * storage call, so a transient Redis outage (or a hit on the provider's
 * request quota) turns into a 500 on every single request, since this guard
 * runs globally. Fail open instead: log the storage error and let the
 * request through unthrottled rather than reject it.
 */
@Injectable()
export class ResilientThrottlerGuard extends ThrottlerGuard {
  private readonly resilientLogger = new Logger(ResilientThrottlerGuard.name);

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    try {
      return await super.handleRequest(requestProps);
    } catch (err) {
      if (err instanceof ThrottlerException) {
        throw err;
      }
      this.resilientLogger.error(
        `Throttler storage unavailable, allowing request through: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return true;
    }
  }
}

const DEFAULT_COOLDOWN_MS = 60_000;

function fingerprint(message: string): string {
  return message.replace(/Usage:\s*\d+/giu, 'Usage: *');
}

export class ErrorLogThrottle {
  private readonly lastLoggedAt = new Map<string, number>();

  constructor(private readonly cooldownMs = DEFAULT_COOLDOWN_MS) {}

  shouldLog(error: unknown, now = Date.now()): boolean {
    const message = error instanceof Error ? error.message : String(error);
    const key = fingerprint(message);
    const last = this.lastLoggedAt.get(key);

    if (last !== undefined && now - last < this.cooldownMs) {
      return false;
    }

    this.lastLoggedAt.set(key, now);
    return true;
  }
}

import { ErrorLogThrottle } from './error-log-throttle';

describe('ErrorLogThrottle', () => {
  it('suppresses repeated provider quota errors during the cooldown', () => {
    const throttle = new ErrorLogThrottle(1_000);

    expect(
      throttle.shouldLog(new Error('Limit exceeded. Usage: 500001'), 1_000),
    ).toBe(true);
    expect(
      throttle.shouldLog(new Error('Limit exceeded. Usage: 500010'), 1_500),
    ).toBe(false);
    expect(
      throttle.shouldLog(new Error('Limit exceeded. Usage: 500020'), 2_001),
    ).toBe(true);
  });

  it('does not suppress a different error', () => {
    const throttle = new ErrorLogThrottle(1_000);

    expect(throttle.shouldLog(new Error('first'), 1_000)).toBe(true);
    expect(throttle.shouldLog(new Error('second'), 1_001)).toBe(true);
  });
});

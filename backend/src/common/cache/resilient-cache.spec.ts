import type { Cache } from 'cache-manager';

import { cacheDel, cacheGet, cacheMget, cacheSet } from './resilient-cache';

describe('resilient cache helpers', () => {
  const cacheManager = {
    get: jest.fn(),
    mget: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  } as unknown as jest.Mocked<Cache>;

  beforeEach(() => jest.clearAllMocks());

  it('returns cached values', async () => {
    cacheManager.get.mockResolvedValue({ id: 'user-1' });

    await expect(cacheGet(cacheManager, 'user:user-1')).resolves.toEqual({
      id: 'user-1',
    });
  });

  it('treats cache read failures as misses', async () => {
    cacheManager.get.mockRejectedValue(new Error('quota exceeded'));

    await expect(
      cacheGet(cacheManager, 'user:user-1'),
    ).resolves.toBeUndefined();
  });

  it('does not reject when cache writes or deletes fail', async () => {
    cacheManager.set.mockRejectedValue(new Error('quota exceeded'));
    cacheManager.del.mockRejectedValue(new Error('quota exceeded'));

    await expect(
      cacheSet(cacheManager, 'key', 'value'),
    ).resolves.toBeUndefined();
    await expect(cacheDel(cacheManager, 'key')).resolves.toBeUndefined();
  });

  it('treats multi-read failures as offline entries', async () => {
    cacheManager.mget.mockRejectedValue(new Error('quota exceeded'));

    await expect(cacheMget(cacheManager, ['one', 'two'])).resolves.toEqual([
      undefined,
      undefined,
    ]);
  });
});

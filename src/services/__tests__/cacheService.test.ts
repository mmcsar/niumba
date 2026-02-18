// Niumba - Cache Service Tests
import { cache, cacheGet, cacheSet, cacheDelete, cacheClear, cacheGetOrSet, CACHE_TTL } from '../cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    cacheClear();
  });

  describe('cacheSet and cacheGet', () => {
    it('should store and retrieve a value', async () => {
      await cacheSet('test-key', 'test-value');
      const value = await cacheGet('test-key');
      expect(value).toBe('test-value');
    });

    it('should return null for non-existent key', async () => {
      const value = await cacheGet('non-existent');
      expect(value).toBeNull();
    });

    it('should store complex objects', async () => {
      const complexObject = { id: '1', name: 'Test', data: { nested: true } };
      await cacheSet('complex-key', complexObject);
      const value = await cacheGet('complex-key');
      expect(value).toEqual(complexObject);
    });

    it('should respect TTL expiration', async () => {
      await cacheSet('ttl-key', 'value', 100); // 100ms TTL
      const value1 = await cacheGet('ttl-key');
      expect(value1).toBe('value');

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      const value2 = await cacheGet('ttl-key');
      expect(value2).toBeNull();
    });
  });

  describe('cacheDelete', () => {
    it('should delete a cached value', async () => {
      await cacheSet('delete-key', 'value');
      await cacheDelete('delete-key');
      const value = await cacheGet('delete-key');
      expect(value).toBeNull();
    });

    it('should not throw error when deleting non-existent key', async () => {
      await expect(cacheDelete('non-existent')).resolves.not.toThrow();
    });
  });

  describe('cacheClear', () => {
    it('should clear all cached values', async () => {
      await cacheSet('key1', 'value1');
      await cacheSet('key2', 'value2');
      
      // cacheClear is async, need to await
      await cacheClear();

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(await cacheGet('key1')).toBeNull();
      expect(await cacheGet('key2')).toBeNull();
    });
  });

  describe('cacheGetOrSet', () => {
    it('should return cached value if exists', async () => {
      await cacheSet('or-set-key', 'cached-value');
      const factory = jest.fn(() => Promise.resolve('new-value'));

      const value = await cacheGetOrSet('or-set-key', factory, CACHE_TTL.SHORT);

      expect(value).toBe('cached-value');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should call factory and cache result if not exists', async () => {
      const factory = jest.fn(() => Promise.resolve('new-value'));

      const value = await cacheGetOrSet('or-set-key', factory, CACHE_TTL.SHORT);

      expect(value).toBe('new-value');
      expect(factory).toHaveBeenCalledTimes(1);

      // Verify it's cached
      const cachedValue = await cacheGet('or-set-key');
      expect(cachedValue).toBe('new-value');
    });
  });
});


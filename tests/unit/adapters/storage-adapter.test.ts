/**
 * Unit Tests for Storage Adapter
 * TDD approach for dependency injection pattern
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { IStorageAdapter } from '@/lib/adapters/storage-adapter';
import { MockStorageAdapter, ChromeStorageAdapter } from '@/lib/adapters/storage-adapter';

describe('IStorageAdapter Interface', () => {
  describe('MockStorageAdapter', () => {
    let adapter: IStorageAdapter;

    beforeEach(() => {
      adapter = new MockStorageAdapter();
    });

    describe('get', () => {
      it('should return null for non-existent key', async () => {
        const result = await adapter.get<string>('nonexistent');
        expect(result).toBeNull();
      });

      it('should return stored value for existing key', async () => {
        await adapter.set('test-key', 'test-value');
        const result = await adapter.get<string>('test-key');
        expect(result).toBe('test-value');
      });

      it('should handle different types', async () => {
        const obj = { foo: 'bar', num: 42 };
        await adapter.set('obj-key', obj);
        const result = await adapter.get<typeof obj>('obj-key');
        expect(result).toEqual(obj);
      });
    });

    describe('set', () => {
      it('should store value', async () => {
        await adapter.set('key1', 'value1');
        const result = await adapter.get<string>('key1');
        expect(result).toBe('value1');
      });

      it('should overwrite existing value', async () => {
        await adapter.set('key1', 'value1');
        await adapter.set('key1', 'value2');
        const result = await adapter.get<string>('key1');
        expect(result).toBe('value2');
      });

      it('should handle complex objects', async () => {
        const complex = {
          nested: { array: [1, 2, 3] },
          bool: true,
          null: null,
        };
        await adapter.set('complex', complex);
        const result = await adapter.get<typeof complex>('complex');
        expect(result).toEqual(complex);
      });
    });

    describe('update', () => {
      it('should merge updates with existing value', async () => {
        await adapter.set('settings', { a: 1, b: 2 });
        const result = await adapter.update('settings', { b: 3, c: 4 });
        expect(result).toEqual({ a: 1, b: 3, c: 4 });
      });

      it('should create new object if key does not exist', async () => {
        const result = await adapter.update('new-key', { x: 10 });
        expect(result).toEqual({ x: 10 });
      });

      it('should handle nested object updates', async () => {
        await adapter.set('config', {
          ui: { theme: 'dark' },
          limits: { max: 100 },
        });
        const result = await adapter.update('config', {
          ui: { theme: 'light' },
        });
        expect(result).toEqual({
          ui: { theme: 'light' },
          limits: { max: 100 },
        });
      });
    });

    describe('remove', () => {
      it('should remove existing key', async () => {
        await adapter.set('temp', 'value');
        await adapter.remove('temp');
        const result = await adapter.get<string>('temp');
        expect(result).toBeNull();
      });

      it('should not throw error for non-existent key', async () => {
        await expect(adapter.remove('nonexistent')).resolves.not.toThrow();
      });
    });

    describe('clear', () => {
      it('should remove all stored data', async () => {
        await adapter.set('key1', 'value1');
        await adapter.set('key2', 'value2');
        await adapter.clear();

        const result1 = await adapter.get<string>('key1');
        const result2 = await adapter.get<string>('key2');

        expect(result1).toBeNull();
        expect(result2).toBeNull();
      });
    });
  });

  describe('ChromeStorageAdapter', () => {
    let adapter: IStorageAdapter;
    let mockStorage: chrome.storage.StorageArea;

    beforeEach(() => {
      // Create mock chrome.storage.StorageArea
      mockStorage = {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
      } as unknown as chrome.storage.StorageArea;

      adapter = new ChromeStorageAdapter(mockStorage);
    });

    describe('get', () => {
      it('should call chrome.storage.get with correct key', async () => {
        vi.mocked(mockStorage.get).mockResolvedValue({ 'test-key': 'test-value' });

        const result = await adapter.get<string>('test-key');

        expect(mockStorage.get).toHaveBeenCalledWith('test-key');
        expect(result).toBe('test-value');
      });

      it('should return null for non-existent key', async () => {
        vi.mocked(mockStorage.get).mockResolvedValue({});

        const result = await adapter.get<string>('nonexistent');

        expect(result).toBeNull();
      });
    });

    describe('set', () => {
      it('should call chrome.storage.set with correct data', async () => {
        vi.mocked(mockStorage.set).mockResolvedValue(undefined);

        await adapter.set('key1', 'value1');

        expect(mockStorage.set).toHaveBeenCalledWith({ key1: 'value1' });
      });
    });

    describe('update', () => {
      it('should merge updates with existing value', async () => {
        vi.mocked(mockStorage.get).mockResolvedValue({
          settings: { a: 1, b: 2 },
        });
        vi.mocked(mockStorage.set).mockResolvedValue(undefined);

        const result = await adapter.update('settings', { b: 3, c: 4 });

        expect(result).toEqual({ a: 1, b: 3, c: 4 });
        expect(mockStorage.set).toHaveBeenCalledWith({
          settings: { a: 1, b: 3, c: 4 },
        });
      });
    });

    describe('remove', () => {
      it('should call chrome.storage.remove with correct key', async () => {
        vi.mocked(mockStorage.remove).mockResolvedValue(undefined);

        await adapter.remove('temp');

        expect(mockStorage.remove).toHaveBeenCalledWith('temp');
      });
    });

    describe('clear', () => {
      it('should call chrome.storage.clear', async () => {
        vi.mocked(mockStorage.clear).mockResolvedValue(undefined);

        await adapter.clear();

        expect(mockStorage.clear).toHaveBeenCalled();
      });
    });
  });
});

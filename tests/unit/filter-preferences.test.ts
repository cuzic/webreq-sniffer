/**
 * Filter Preferences Tests
 * TDD for persisting filter state (duplicate/manifest filters)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FilterPreferences,
  saveFilterPreferences,
  loadFilterPreferences,
  getDefaultFilterPreferences,
} from '@/lib/filter-preferences';
import { DuplicateStrategy } from '@/lib/duplicate-detector';

describe('Filter Preferences', () => {
  // Mock chrome.storage.local
  const mockStorage: Record<string, any> = {};

  beforeEach(() => {
    // Clear mock storage
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);

    // Mock chrome.storage.local
    global.chrome = {
      storage: {
        local: {
          get: vi.fn((keys, callback) => {
            const result: Record<string, any> = {};
            if (typeof keys === 'string') {
              if (mockStorage[keys]) {
                result[keys] = mockStorage[keys];
              }
            } else if (Array.isArray(keys)) {
              keys.forEach((key) => {
                if (mockStorage[key]) {
                  result[key] = mockStorage[key];
                }
              });
            }
            callback?.(result);
            return Promise.resolve(result);
          }),
          set: vi.fn((items, callback) => {
            Object.assign(mockStorage, items);
            callback?.();
            return Promise.resolve();
          }),
        },
      },
    } as any;
  });

  describe('getDefaultFilterPreferences', () => {
    it('should return default filter preferences', () => {
      const defaults = getDefaultFilterPreferences();

      expect(defaults).toEqual({
        showDuplicatesOnly: false,
        duplicateStrategy: DuplicateStrategy.KEEP_FIRST,
        smartFilterEnabled: false,
      });
    });
  });

  describe('saveFilterPreferences', () => {
    it('should save filter preferences to chrome.storage.local', async () => {
      const preferences: FilterPreferences = {
        showDuplicatesOnly: true,
        duplicateStrategy: DuplicateStrategy.KEEP_LAST,
        smartFilterEnabled: true,
      };

      await saveFilterPreferences(preferences);

      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        { filterPreferences: preferences },
        expect.any(Function)
      );
      expect(mockStorage.filterPreferences).toEqual(preferences);
    });

    it('should save partial preferences and merge with defaults', async () => {
      const preferences: Partial<FilterPreferences> = {
        showDuplicatesOnly: true,
      };

      await saveFilterPreferences(preferences);

      expect(mockStorage.filterPreferences).toEqual({
        showDuplicatesOnly: true,
        duplicateStrategy: DuplicateStrategy.KEEP_FIRST,
        smartFilterEnabled: false,
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock storage.set to throw error
      vi.mocked(chrome.storage.local.set).mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      await expect(saveFilterPreferences({})).resolves.not.toThrow();
    });
  });

  describe('loadFilterPreferences', () => {
    it('should load filter preferences from chrome.storage.local', async () => {
      const preferences: FilterPreferences = {
        showDuplicatesOnly: true,
        duplicateStrategy: DuplicateStrategy.KEEP_LAST,
        smartFilterEnabled: true,
      };
      mockStorage.filterPreferences = preferences;

      const loaded = await loadFilterPreferences();

      expect(chrome.storage.local.get).toHaveBeenCalledWith(
        ['filterPreferences'],
        expect.any(Function)
      );
      expect(loaded).toEqual(preferences);
    });

    it('should return defaults when no preferences are stored', async () => {
      const loaded = await loadFilterPreferences();

      expect(loaded).toEqual(getDefaultFilterPreferences());
    });

    it('should merge partial stored preferences with defaults', async () => {
      mockStorage.filterPreferences = {
        showDuplicatesOnly: true,
        // duplicateStrategy and smartFilterEnabled missing
      };

      const loaded = await loadFilterPreferences();

      expect(loaded).toEqual({
        showDuplicatesOnly: true,
        duplicateStrategy: DuplicateStrategy.KEEP_FIRST,
        smartFilterEnabled: false,
      });
    });

    it('should handle errors gracefully and return defaults', async () => {
      // Mock storage.get to throw error
      vi.mocked(chrome.storage.local.get).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const loaded = await loadFilterPreferences();

      expect(loaded).toEqual(getDefaultFilterPreferences());
    });

    it('should validate duplicateStrategy enum values', async () => {
      mockStorage.filterPreferences = {
        showDuplicatesOnly: true,
        duplicateStrategy: 'invalid_strategy', // Invalid value
        smartFilterEnabled: true,
      };

      const loaded = await loadFilterPreferences();

      // Should fall back to default strategy
      expect(loaded.duplicateStrategy).toBe(DuplicateStrategy.KEEP_FIRST);
    });
  });

  describe('Integration', () => {
    it('should persist preferences across save/load cycle', async () => {
      const preferences: FilterPreferences = {
        showDuplicatesOnly: true,
        duplicateStrategy: DuplicateStrategy.KEEP_LAST,
        smartFilterEnabled: true,
      };

      await saveFilterPreferences(preferences);
      const loaded = await loadFilterPreferences();

      expect(loaded).toEqual(preferences);
    });

    it('should update only changed preferences', async () => {
      // Initial save
      await saveFilterPreferences({
        showDuplicatesOnly: true,
        duplicateStrategy: DuplicateStrategy.KEEP_FIRST,
        smartFilterEnabled: false,
      });

      // Update only smartFilterEnabled
      await saveFilterPreferences({
        smartFilterEnabled: true,
      });

      const loaded = await loadFilterPreferences();

      expect(loaded).toEqual({
        showDuplicatesOnly: true,
        duplicateStrategy: DuplicateStrategy.KEEP_FIRST,
        smartFilterEnabled: true,
      });
    });
  });
});

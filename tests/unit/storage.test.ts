/**
 * Unit Tests for Storage Operations
 * Tests dependency injection pattern
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockStorageAdapter } from '@/lib/adapters/storage-adapter';
import {
  getLogData,
  setLogData,
  updateLogData,
  getSettings,
  setSettings,
  updateSettings,
  injectStorageAdapters,
} from '@/background/storage';
import { defaultLogData, defaultSettings } from '@/types';
import type { LogData, Settings } from '@/types';

describe('Storage Operations with Dependency Injection', () => {
  let mockLocal: MockStorageAdapter;
  let mockSync: MockStorageAdapter;

  beforeEach(() => {
    // Create fresh mock adapters for each test
    mockLocal = new MockStorageAdapter();
    mockSync = new MockStorageAdapter();

    // Inject them into the storage module
    injectStorageAdapters(mockLocal, mockSync);
  });

  describe('LogData Operations', () => {
    describe('getLogData', () => {
      it('should return default log data when storage is empty', async () => {
        const result = await getLogData();
        expect(result).toEqual(defaultLogData);
      });

      it('should return stored log data', async () => {
        const testData: LogData = {
          isMonitoring: true,
          monitoringScope: 'allTabs',
          entries: [],
        };
        await mockLocal.set('logData', testData);

        const result = await getLogData();
        expect(result).toEqual(testData);
      });
    });

    describe('setLogData', () => {
      it('should store log data', async () => {
        const testData: LogData = {
          isMonitoring: true,
          monitoringScope: 'activeTab',
          activeTabId: 123,
          entries: [],
        };

        await setLogData(testData);

        const stored = await mockLocal.get<LogData>('logData');
        expect(stored).toEqual(testData);
      });
    });

    describe('updateLogData', () => {
      it('should update log data partially', async () => {
        const initial: LogData = {
          isMonitoring: false,
          monitoringScope: 'activeTab',
          entries: [],
        };
        await mockLocal.set('logData', initial);

        const result = await updateLogData({ isMonitoring: true });

        expect(result).toEqual({
          isMonitoring: true,
          monitoringScope: 'activeTab',
          entries: [],
        });
      });

      it('should handle updates to empty storage', async () => {
        const result = await updateLogData({ isMonitoring: true });

        expect(result.isMonitoring).toBe(true);
      });
    });
  });

  describe('Settings Operations', () => {
    describe('getSettings', () => {
      it('should return default settings when storage is empty', async () => {
        const result = await getSettings();
        expect(result).toEqual(defaultSettings);
      });

      it('should return stored settings', async () => {
        const testSettings: Settings = {
          ...defaultSettings,
          targetScope: 'allTabs',
        };
        await mockSync.set('settings', testSettings);

        const result = await getSettings();
        expect(result).toEqual(testSettings);
      });
    });

    describe('setSettings', () => {
      it('should store settings', async () => {
        const testSettings: Settings = {
          ...defaultSettings,
          hlsMpdMode: 'playlistOnly',
        };

        await setSettings(testSettings);

        const stored = await mockSync.get<Settings>('settings');
        expect(stored).toEqual(testSettings);
      });
    });

    describe('updateSettings', () => {
      it('should update settings partially', async () => {
        await mockSync.set('settings', defaultSettings);

        const result = await updateSettings({
          targetScope: 'allTabs',
          hlsMpdMode: 'playlistOnly',
        });

        expect(result.targetScope).toBe('allTabs');
        expect(result.hlsMpdMode).toBe('playlistOnly');
      });

      it('should handle updates to empty storage', async () => {
        const result = await updateSettings({
          simpleFilters: ['.m3u8', '.mpd'],
        });

        expect(result.simpleFilters).toEqual(['.m3u8', '.mpd']);
      });
    });
  });
});

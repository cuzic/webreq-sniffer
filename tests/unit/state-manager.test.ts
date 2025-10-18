/**
 * Unit Tests for State Manager
 * TDD approach for caching layer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from '@/background/state-manager';
import { MockStorageAdapter } from '@/lib/adapters/storage-adapter';
import { defaultSettings, defaultLogData } from '@/types';
import type { Settings, LogData } from '@/types';

describe('StateManager', () => {
  let stateManager: StateManager;
  let mockLocalAdapter: MockStorageAdapter;
  let mockSyncAdapter: MockStorageAdapter;

  beforeEach(() => {
    mockLocalAdapter = new MockStorageAdapter();
    mockSyncAdapter = new MockStorageAdapter();
    stateManager = new StateManager(mockLocalAdapter, mockSyncAdapter);
  });

  describe('Settings Cache', () => {
    describe('getSettings', () => {
      it('should fetch settings from storage on first call', async () => {
        const testSettings: Settings = { ...defaultSettings, targetScope: 'allTabs' };
        await mockSyncAdapter.set('settings', testSettings);

        const result = await stateManager.getSettings();

        expect(result).toEqual(testSettings);
      });

      it('should return cached settings on subsequent calls within TTL', async () => {
        const testSettings: Settings = { ...defaultSettings, targetScope: 'allTabs' };
        await mockSyncAdapter.set('settings', testSettings);

        // First call - fetches from storage
        const result1 = await stateManager.getSettings();

        // Modify storage (should not affect cached result)
        await mockSyncAdapter.set('settings', { ...defaultSettings, targetScope: 'activeTab' });

        // Second call - should return cached value
        const result2 = await stateManager.getSettings();

        expect(result1).toEqual(result2);
        expect(result2.targetScope).toBe('allTabs');
      });

      it('should refresh cache after TTL expires', async () => {
        // Use a short TTL for testing
        const shortTTLManager = new StateManager(mockLocalAdapter, mockSyncAdapter, 100);

        const initialSettings: Settings = { ...defaultSettings, targetScope: 'allTabs' };
        await mockSyncAdapter.set('settings', initialSettings);

        // First call
        const result1 = await shortTTLManager.getSettings();
        expect(result1.targetScope).toBe('allTabs');

        // Wait for cache to expire
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Update storage
        const updatedSettings: Settings = { ...defaultSettings, targetScope: 'activeTab' };
        await mockSyncAdapter.set('settings', updatedSettings);

        // Should fetch fresh data
        const result2 = await shortTTLManager.getSettings();
        expect(result2.targetScope).toBe('activeTab');
      });

      it('should force refresh when forceRefresh is true', async () => {
        const initialSettings: Settings = { ...defaultSettings, targetScope: 'allTabs' };
        await mockSyncAdapter.set('settings', initialSettings);

        // First call - caches settings
        await stateManager.getSettings();

        // Update storage
        const updatedSettings: Settings = { ...defaultSettings, targetScope: 'activeTab' };
        await mockSyncAdapter.set('settings', updatedSettings);

        // Force refresh - should ignore cache
        const result = await stateManager.getSettings(true);
        expect(result.targetScope).toBe('activeTab');
      });

      it('should return default settings when storage is empty', async () => {
        const result = await stateManager.getSettings();
        expect(result).toEqual(defaultSettings);
      });
    });

    describe('updateSettings', () => {
      it('should update settings in storage', async () => {
        await mockSyncAdapter.set('settings', defaultSettings);

        const updates = { targetScope: 'allTabs' as const };
        const result = await stateManager.updateSettings(updates);

        expect(result.targetScope).toBe('allTabs');

        const stored = await mockSyncAdapter.get<Settings>('settings');
        expect(stored?.targetScope).toBe('allTabs');
      });

      it('should update cache after updating settings', async () => {
        await mockSyncAdapter.set('settings', defaultSettings);

        // Update settings
        await stateManager.updateSettings({ targetScope: 'allTabs' });

        // Get settings - should return cached updated value
        const result = await stateManager.getSettings();
        expect(result.targetScope).toBe('allTabs');
      });
    });
  });

  describe('LogData Cache', () => {
    describe('getLogData', () => {
      it('should fetch log data from storage on first call', async () => {
        const testLogData: LogData = {
          isMonitoring: true,
          monitoringScope: 'allTabs',
          entries: [],
        };
        await mockLocalAdapter.set('logData', testLogData);

        const result = await stateManager.getLogData();

        expect(result).toEqual(testLogData);
      });

      it('should return cached log data on subsequent calls within TTL', async () => {
        const testLogData: LogData = {
          isMonitoring: true,
          monitoringScope: 'allTabs',
          entries: [],
        };
        await mockLocalAdapter.set('logData', testLogData);

        // First call
        const result1 = await stateManager.getLogData();

        // Modify storage
        await mockLocalAdapter.set('logData', {
          ...testLogData,
          isMonitoring: false,
        });

        // Second call - should return cached value
        const result2 = await stateManager.getLogData();

        expect(result1).toEqual(result2);
        expect(result2.isMonitoring).toBe(true);
      });

      it('should return default log data when storage is empty', async () => {
        const result = await stateManager.getLogData();
        expect(result).toEqual(defaultLogData);
      });
    });

    describe('updateLogData', () => {
      it('should update log data in storage', async () => {
        await mockLocalAdapter.set('logData', defaultLogData);

        const updates = { isMonitoring: true };
        const result = await stateManager.updateLogData(updates);

        expect(result.isMonitoring).toBe(true);

        const stored = await mockLocalAdapter.get<LogData>('logData');
        expect(stored?.isMonitoring).toBe(true);
      });

      it('should update cache after updating log data', async () => {
        await mockLocalAdapter.set('logData', defaultLogData);

        // Update log data
        await stateManager.updateLogData({ isMonitoring: true });

        // Get log data - should return cached updated value
        const result = await stateManager.getLogData();
        expect(result.isMonitoring).toBe(true);
      });
    });
  });

  describe('Cache Management', () => {
    describe('invalidateCache', () => {
      it('should clear both settings and log data cache', async () => {
        const testSettings: Settings = { ...defaultSettings, targetScope: 'allTabs' };
        const testLogData: LogData = {
          isMonitoring: true,
          monitoringScope: 'allTabs',
          entries: [],
        };

        await mockSyncAdapter.set('settings', testSettings);
        await mockLocalAdapter.set('logData', testLogData);

        // Cache both
        await stateManager.getSettings();
        await stateManager.getLogData();

        // Modify storage
        await mockSyncAdapter.set('settings', { ...defaultSettings, targetScope: 'activeTab' });
        await mockLocalAdapter.set('logData', { ...testLogData, isMonitoring: false });

        // Invalidate cache
        stateManager.invalidateCache();

        // Should fetch fresh data
        const settings = await stateManager.getSettings();
        const logData = await stateManager.getLogData();

        expect(settings.targetScope).toBe('activeTab');
        expect(logData.isMonitoring).toBe(false);
      });
    });

    describe('Cache TTL', () => {
      it('should have configurable cache TTL', () => {
        const customTTL = 10000;
        const manager = new StateManager(mockLocalAdapter, mockSyncAdapter, customTTL);

        // TTLは内部的に設定されている（プライベートなので直接テストできないが、動作で確認）
        expect(manager).toBeDefined();
      });
    });
  });

  describe('Performance', () => {
    it('should reduce storage access with caching', async () => {
      const getSpy = vi.spyOn(mockSyncAdapter, 'get');

      await mockSyncAdapter.set('settings', defaultSettings);

      // First call - accesses storage
      await stateManager.getSettings();
      expect(getSpy).toHaveBeenCalledTimes(1);

      // Subsequent calls - use cache
      await stateManager.getSettings();
      await stateManager.getSettings();
      await stateManager.getSettings();

      // Should still be only 1 call
      expect(getSpy).toHaveBeenCalledTimes(1);
    });
  });
});

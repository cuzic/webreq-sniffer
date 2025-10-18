/**
 * Storage Operations Module
 * Handles chrome.storage.local and chrome.storage.sync operations
 * Uses dependency injection pattern with storage adapters
 */

import type { LogData, Settings } from '@/types';
import { defaultLogData, defaultSettings } from '@/types';
import type { IStorageAdapter } from '@/lib/adapters/storage-adapter';
import { createChromeLocalAdapter, createChromeSyncAdapter } from '@/lib/adapters/storage-adapter';

// Storage adapters (can be injected for testing)
let localAdapter: IStorageAdapter = createChromeLocalAdapter();
let syncAdapter: IStorageAdapter = createChromeSyncAdapter();

/**
 * Inject custom storage adapters (for testing)
 */
export function injectStorageAdapters(local: IStorageAdapter, sync: IStorageAdapter): void {
  localAdapter = local;
  syncAdapter = sync;
}

// ========================================
// LogData Operations (storage.local)
// ========================================

/**
 * Get log data from storage.local
 */
export async function getLogData(): Promise<LogData> {
  const result = await localAdapter.get<LogData>('logData');
  return result || defaultLogData;
}

/**
 * Save log data to storage.local
 */
export async function setLogData(logData: LogData): Promise<void> {
  await localAdapter.set('logData', logData);
}

/**
 * Update log data partially
 */
export async function updateLogData(updates: Partial<LogData>): Promise<LogData> {
  return await localAdapter.update<LogData>('logData', updates);
}

// ========================================
// Settings Operations (storage.sync)
// ========================================

/**
 * Get settings from storage.sync
 */
export async function getSettings(): Promise<Settings> {
  const result = await syncAdapter.get<Settings>('settings');
  return result || defaultSettings;
}

/**
 * Save settings to storage.sync
 */
export async function setSettings(settings: Settings): Promise<void> {
  await syncAdapter.set('settings', settings);
}

/**
 * Update settings partially
 */
export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  return await syncAdapter.update<Settings>('settings', updates);
}

// ========================================
// Initialization
// ========================================

/**
 * Initialize default data in storage
 */
export async function initializeStorage(): Promise<void> {
  await setSettings(defaultSettings);
  await setLogData(defaultLogData);
  console.log('Storage initialized with defaults');
}

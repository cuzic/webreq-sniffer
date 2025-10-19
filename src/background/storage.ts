/**
 * Storage Operations Module
 * Handles chrome.storage.local and chrome.storage.sync operations
 * Uses dependency injection pattern with storage adapters
 */

import type { LogData, Settings } from '@/types';
import { defaultLogData, defaultSettings } from '@/types';
import type { IStorageAdapter } from '@/lib/adapters/storage-adapter';
import { createChromeLocalAdapter, createChromeSyncAdapter } from '@/lib/adapters/storage-adapter';
import { StateManager } from './state-manager';

// Storage adapters (can be injected for testing)
let localAdapter: IStorageAdapter = createChromeLocalAdapter();
let syncAdapter: IStorageAdapter = createChromeSyncAdapter();

// State manager with caching
let stateManager: StateManager = new StateManager(localAdapter, syncAdapter);

/**
 * Inject custom storage adapters (for testing)
 */
export function injectStorageAdapters(local: IStorageAdapter, sync: IStorageAdapter): void {
  localAdapter = local;
  syncAdapter = sync;
  // Recreate state manager with new adapters
  stateManager = new StateManager(local, sync);
}

/**
 * Get state manager instance (for advanced usage)
 */
export function getStateManager(): StateManager {
  return stateManager;
}

// ========================================
// LogData Operations (storage.local)
// ========================================

/**
 * Get log data from storage.local (with caching)
 */
export async function getLogData(): Promise<LogData> {
  return await stateManager.getLogData();
}

/**
 * Save log data to storage.local (updates cache)
 */
export async function setLogData(logData: LogData): Promise<void> {
  await stateManager.setLogData(logData);
}

/**
 * Update log data partially (updates cache)
 */
export async function updateLogData(updates: Partial<LogData>): Promise<LogData> {
  return await stateManager.updateLogData(updates);
}

// ========================================
// Settings Operations (storage.sync)
// ========================================

/**
 * Get settings from storage.sync (with caching)
 */
export async function getSettings(): Promise<Settings> {
  return await stateManager.getSettings();
}

/**
 * Save settings to storage.sync (updates cache)
 */
export async function setSettings(settings: Settings): Promise<void> {
  await stateManager.setSettings(settings);
}

/**
 * Update settings partially (updates cache)
 */
export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  return await stateManager.updateSettings(updates);
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
}

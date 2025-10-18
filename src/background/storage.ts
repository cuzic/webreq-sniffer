/**
 * Storage Operations Module
 * Handles chrome.storage.local and chrome.storage.sync operations
 */

import type { LogData, Settings } from '@/types';
import { defaultLogData, defaultSettings } from '@/types';

// ========================================
// LogData Operations (storage.local)
// ========================================

/**
 * Get log data from storage.local
 */
export async function getLogData(): Promise<LogData> {
  const result = await chrome.storage.local.get('logData');
  return (result.logData as LogData) || defaultLogData;
}

/**
 * Save log data to storage.local
 */
export async function setLogData(logData: LogData): Promise<void> {
  await chrome.storage.local.set({ logData });
}

/**
 * Update log data partially
 */
export async function updateLogData(updates: Partial<LogData>): Promise<LogData> {
  const logData = await getLogData();
  const updatedLogData = { ...logData, ...updates };
  await setLogData(updatedLogData);
  return updatedLogData;
}

// ========================================
// Settings Operations (storage.sync)
// ========================================

/**
 * Get settings from storage.sync
 */
export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get('settings');
  return (result.settings as Settings) || defaultSettings;
}

/**
 * Save settings to storage.sync
 */
export async function setSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ settings });
}

/**
 * Update settings partially
 */
export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  const settings = await getSettings();
  const updatedSettings = { ...settings, ...updates };
  await setSettings(updatedSettings);
  return updatedSettings;
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

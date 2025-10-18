/**
 * Chrome Messaging Utilities for Options Page
 * Handles settings management with Service Worker
 */

import type { Settings, LogEntry } from '@/types';
import { sendMessage } from '@/lib/messaging';

/**
 * Get current settings
 */
export async function getSettings(): Promise<Settings> {
  return sendMessage({
    type: 'get-settings',
  });
}

/**
 * Update settings
 */
export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  await sendMessage({
    type: 'update-settings',
    payload: settings,
  });
}

/**
 * Get current status (for filter preview)
 */
export async function getStatus(): Promise<{
  isMonitoring: boolean;
  monitoringScope: 'activeTab' | 'allTabs';
  activeTabId?: number;
  entryCount: number;
  entries: LogEntry[];
}> {
  return sendMessage({
    type: 'get-status',
  });
}

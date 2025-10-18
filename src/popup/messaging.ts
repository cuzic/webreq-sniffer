/**
 * Chrome Messaging Utilities for Popup
 * Handles communication with Service Worker
 */

import type { ExportFormat, LogEntry } from '@/types';
import { sendMessage } from '@/lib/messaging';

/**
 * Start monitoring
 */
export async function startMonitoring(scope: 'activeTab' | 'allTabs'): Promise<void> {
  const activeTabId = scope === 'activeTab' ? await getCurrentTabId() : undefined;

  await sendMessage({
    type: 'start-monitoring',
    payload: { scope, activeTabId },
  });
}

/**
 * Stop monitoring
 */
export async function stopMonitoring(): Promise<void> {
  await sendMessage({
    type: 'stop-monitoring',
  });
}

/**
 * Get current status
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

/**
 * Clear all logs
 */
export async function clearLogs(): Promise<void> {
  await sendMessage({
    type: 'clear-logs',
  });
}

/**
 * Export logs
 */
export async function exportLogs(
  format: ExportFormat,
  selectedIds?: string[]
): Promise<{ filename: string }> {
  return sendMessage({
    type: 'export-logs',
    payload: { format, selectedIds },
  });
}

/**
 * Get current tab ID
 */
async function getCurrentTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    throw new Error('Could not get active tab');
  }
  return tab.id;
}

/**
 * Open options page
 */
export function openOptionsPage(): void {
  chrome.runtime.openOptionsPage();
}

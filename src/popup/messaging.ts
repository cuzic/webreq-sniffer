/**
 * Chrome Messaging Utilities for Popup
 * Handles communication with Service Worker
 */

import type { Message, MessageResponse, ExportFormat } from '@/types';

/**
 * Send message to Service Worker
 */
export async function sendMessage<T = unknown>(message: Message): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: MessageResponse) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (!response) {
        reject(new Error('No response from Service Worker'));
        return;
      }

      if (!response.success) {
        reject(new Error(response.error || 'Unknown error'));
        return;
      }

      resolve(response.data as T);
    });
  });
}

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
export async function exportLogs(format: ExportFormat): Promise<{ filename: string }> {
  return sendMessage({
    type: 'export-logs',
    payload: { format },
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

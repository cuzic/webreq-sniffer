/**
 * Message Handlers Module
 * Handles messages from Popup and Options pages
 */

import type { Message, MessageResponse } from '@/types';
import { getLogData, getSettings, updateLogData, updateSettings } from './storage';
import { updateBadge } from './badge';
import { exportLogs } from './export';

/**
 * Start monitoring network requests
 */
export async function startMonitoring(
  scope: 'activeTab' | 'allTabs',
  activeTabId?: number
): Promise<void> {
  await updateLogData({
    isMonitoring: true,
    monitoringScope: scope,
    activeTabId,
  });

  await updateBadge(true);

  console.log('Monitoring started', { scope, activeTabId });
}

/**
 * Stop monitoring network requests
 */
export async function stopMonitoring(): Promise<void> {
  const logData = await getLogData();
  logData.isMonitoring = false;
  delete logData.activeTabId;

  await updateLogData(logData);
  await updateBadge(false);

  console.log('Monitoring stopped');
}

/**
 * Get current monitoring status
 */
export async function getStatus(): Promise<{
  isMonitoring: boolean;
  monitoringScope: 'activeTab' | 'allTabs';
  activeTabId?: number;
  entryCount: number;
}> {
  const logData = await getLogData();

  return {
    isMonitoring: logData.isMonitoring,
    monitoringScope: logData.monitoringScope,
    activeTabId: logData.activeTabId,
    entryCount: logData.entries.length,
  };
}

/**
 * Clear all logged entries
 */
export async function clearLogs(): Promise<void> {
  await updateLogData({ entries: [] });
  console.log('Logs cleared');
}

/**
 * Handle runtime messages
 * Type-safe message handling with discriminated unions
 */
export function handleMessage(
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: MessageResponse) => void
): boolean {
  console.log('Message received:', message.type, sender);

  // Handle async operations
  (async () => {
    try {
      switch (message.type) {
        case 'start-monitoring': {
          // TypeScript now knows payload is { scope, activeTabId? }
          const { scope, activeTabId } = message.payload;
          await startMonitoring(scope, activeTabId);
          sendResponse({ success: true });
          break;
        }

        case 'stop-monitoring': {
          await stopMonitoring();
          sendResponse({ success: true });
          break;
        }

        case 'get-status': {
          const status = await getStatus();
          sendResponse({ success: true, data: status });
          break;
        }

        case 'clear-logs': {
          await clearLogs();
          sendResponse({ success: true });
          break;
        }

        case 'get-settings': {
          const settings = await getSettings();
          sendResponse({ success: true, data: settings });
          break;
        }

        case 'update-settings': {
          // TypeScript now knows payload is Partial<Settings>
          const newSettings = message.payload;
          await updateSettings(newSettings);
          sendResponse({ success: true });
          break;
        }

        case 'export-logs': {
          // TypeScript now knows payload is { format: ExportFormat }
          const { format } = message.payload;
          const logData = await getLogData();
          const settings = await getSettings();

          const filename = await exportLogs(logData.entries, format, settings.exportSettings);

          sendResponse({ success: true, data: { filename } });
          break;
        }

        default: {
          // Exhaustiveness check - TypeScript will error if we miss a case
          const _exhaustive: never = message;
          sendResponse({
            success: false,
            error: `Unknown message type: ${(_exhaustive as Message).type}`,
          });
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })();

  // Return true to indicate we will send a response asynchronously
  return true;
}

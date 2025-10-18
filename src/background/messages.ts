/**
 * Message Handlers Module
 * Handles messages from Popup and Options pages
 */

import type { Message, MessageResponse, Settings, ExportFormat } from '@/types';
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
          const { scope, activeTabId } = message.payload as {
            scope: 'activeTab' | 'allTabs';
            activeTabId?: number;
          };
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
          const newSettings = message.payload as Partial<Settings>;
          await updateSettings(newSettings);
          sendResponse({ success: true });
          break;
        }

        case 'export-logs': {
          const { format } = message.payload as { format: ExportFormat };
          const logData = await getLogData();
          const settings = await getSettings();

          const filename = await exportLogs(logData.entries, format, settings.exportSettings);

          sendResponse({ success: true, data: { filename } });
          break;
        }

        default:
          sendResponse({
            success: false,
            error: `Unknown message type: ${message.type}`,
          });
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

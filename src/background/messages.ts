/**
 * Message Handlers Module
 * Handles messages from Popup and Options pages
 */

import type { Message, MessageResponse, LogEntry } from '@/types';
import { getLogData, getSettings, updateLogData, updateSettings } from './storage';
import { updateBadge } from './badge';
import { exportLogs } from '@/lib/export';
import { Logger } from '@/lib/logger';

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
}

/**
 * Get current monitoring status
 */
export async function getStatus(): Promise<{
  isMonitoring: boolean;
  monitoringScope: 'activeTab' | 'allTabs';
  activeTabId?: number;
  entryCount: number;
  entries: LogEntry[];
}> {
  const logData = await getLogData();

  return {
    isMonitoring: logData.isMonitoring,
    monitoringScope: logData.monitoringScope,
    activeTabId: logData.activeTabId,
    entryCount: logData.entries.length,
    entries: logData.entries,
  };
}

/**
 * Clear all logged entries
 */
export async function clearLogs(): Promise<void> {
  await updateLogData({ entries: [] });
}

/**
 * Message handler function type
 */
type MessageHandler = (
  message: Message,
  sender: chrome.runtime.MessageSender
) => Promise<MessageResponse>;

/**
 * Message handlers map (reduces cyclomatic complexity)
 * Each handler is responsible for processing one message type
 */
const messageHandlers: Record<Message['type'], MessageHandler> = {
  'start-monitoring': async (message) => {
    if (message.type !== 'start-monitoring') throw new Error('Invalid message type');
    const { scope, activeTabId } = message.payload;
    await startMonitoring(scope, activeTabId);
    return { success: true };
  },

  'stop-monitoring': async () => {
    await stopMonitoring();
    return { success: true };
  },

  'get-status': async () => {
    const status = await getStatus();
    return { success: true, data: status };
  },

  'clear-logs': async () => {
    await clearLogs();
    return { success: true };
  },

  'get-settings': async () => {
    const settings = await getSettings();
    return { success: true, data: settings };
  },

  'update-settings': async (message) => {
    if (message.type !== 'update-settings') throw new Error('Invalid message type');
    const newSettings = message.payload;
    await updateSettings(newSettings);
    return { success: true };
  },

  'export-logs': async (message) => {
    if (message.type !== 'export-logs') throw new Error('Invalid message type');
    const { format, selectedIds } = message.payload;
    const logData = await getLogData();
    const settings = await getSettings();

    // Filter entries if selectedIds is provided
    const entriesToExport = selectedIds
      ? logData.entries.filter((entry) => selectedIds.includes(entry.id))
      : logData.entries;

    const filename = await exportLogs(entriesToExport, format, settings.exportSettings);

    return { success: true, data: { filename } };
  },
};

/**
 * Handle runtime messages
 * Type-safe message handling with handler map pattern
 * Cyclomatic complexity: 2 (was 8)
 */
export function handleMessage(
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: MessageResponse) => void
): boolean {
  // Handle async operations
  (async () => {
    try {
      const handler = messageHandlers[message.type];
      if (!handler) {
        sendResponse({
          success: false,
          error: `Unknown message type: ${message.type}`,
        });
        return;
      }

      const response = await handler(message, sender);
      sendResponse(response);
    } catch (error) {
      Logger.error('message-handler', error, { messageType: message.type });
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })();

  // Return true to indicate we will send a response asynchronously
  return true;
}

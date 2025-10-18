/**
 * webRequest Listeners Module
 * Handles network request interception and logging
 */

import { getLogData, getSettings } from './storage';
import { shouldLogRequest } from './filtering';
import { createLogEntry, addLogEntry } from './logging';

/**
 * Handle request before it's sent
 * This is where we capture and filter requests
 */
export function handleBeforeRequest(details: any): undefined {
  // Process request asynchronously (don't block the request)
  (async () => {
    try {
      // Check if monitoring is enabled
      const logData = await getLogData();
      if (!logData.isMonitoring) {
        return; // Not monitoring, skip
      }

      // Check tab scope
      if (logData.monitoringScope === 'activeTab') {
        if (details.tabId !== logData.activeTabId) {
          return; // Not the active tab, skip
        }
      }

      // Get settings for filtering
      const settings = await getSettings();

      // Apply filtering logic
      if (!shouldLogRequest(details.url, details.type, settings)) {
        return; // Filtered out
      }

      // Create log entry
      const entry = createLogEntry(details);

      // Add to log
      await addLogEntry(entry, settings);

      console.log('Request logged:', details.url);
    } catch (error) {
      console.error('Error handling request:', error);
    }
  })();

  return undefined;
}

/**
 * Handle request headers before they're sent
 * This is where we can capture headers if needed
 */
export function handleBeforeSendHeaders(details: any): undefined {
  // Check if monitoring is enabled - async check removed to match signature
  // Headers will be added to the existing entry
  // For now, we create entries in onBeforeRequest
  // This listener can be used for header-specific logic later

  console.log('Headers captured for:', details.url);

  return undefined;
}

/**
 * Register all webRequest listeners
 */
export function registerWebRequestListeners(): void {
  chrome.webRequest.onBeforeRequest.addListener(handleBeforeRequest, { urls: ['<all_urls>'] });

  chrome.webRequest.onBeforeSendHeaders.addListener(
    handleBeforeSendHeaders,
    { urls: ['<all_urls>'] },
    ['requestHeaders', 'extraHeaders']
  );

  console.log('webRequest listeners registered');
}

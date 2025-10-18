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
export async function handleBeforeRequest(
  details: chrome.webRequest.WebRequestDetails
): Promise<void> {
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
}

/**
 * Handle request headers before they're sent
 * This is where we can capture headers if needed
 */
export async function handleBeforeSendHeaders(
  details: chrome.webRequest.WebRequestHeadersDetails
): Promise<void> {
  // Check if monitoring is enabled
  const logData = await getLogData();
  if (!logData.isMonitoring) {
    return;
  }

  // Get settings
  const settings = await getSettings();

  // Only collect headers if enabled
  if (!settings.headerPolicy.basic) {
    return;
  }

  // Headers will be added to the existing entry
  // For now, we create entries in onBeforeRequest
  // This listener can be used for header-specific logic later

  console.log('Headers captured for:', details.url);
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

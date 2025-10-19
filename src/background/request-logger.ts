/**
 * RequestLogger Class
 * Encapsulates logging logic for web requests
 */

import { createLogEntry, isDuplicate } from './logging';
import type { StateManager } from './state-manager';
import type { PageMetadata } from '@/types';

/**
 * RequestLogger handles creation and storage of log entries
 */
export class RequestLogger {
  constructor(private stateManager: StateManager) {}

  /**
   * Log a web request
   * @param details Web request details
   * @param headers Optional request headers
   * @param pageMetadata Optional page metadata from content script
   */
  async logRequest(
    details: chrome.webRequest.WebRequestDetails,
    headers?: chrome.webRequest.HttpHeader[],
    pageMetadata?: PageMetadata
  ): Promise<void> {
    // Create log entry
    const entry = createLogEntry(details, headers, pageMetadata);

    // Get current log data and settings (force refresh to avoid stale cache)
    const logData = await this.stateManager.getLogData(true);
    const settings = await this.stateManager.getSettings();

    // Check for duplicates
    if (isDuplicate(entry.dedupeKey, logData.entries)) {
      return;
    }

    // Add new entry
    logData.entries.push(entry);

    // Ring buffer: remove oldest if over limit
    const maxEntries = settings.limits.maxEntries;
    if (logData.entries.length > maxEntries) {
      const removeCount = logData.entries.length - maxEntries;
      logData.entries.splice(0, removeCount);
    }

    // Update storage with complete log data
    await this.stateManager.setLogData(logData);
  }
}

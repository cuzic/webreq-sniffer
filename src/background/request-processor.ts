/**
 * RequestProcessor Class
 * Coordinates request processing by delegating to filtering and logging
 */

import type { StateManager } from './state-manager';
import type { RequestLogger } from './request-logger';
import type { PageMetadata } from '@/types';
import { shouldLogRequest } from './filtering';

/**
 * RequestProcessor coordinates the request handling workflow
 * Separates concerns: monitoring check -> filtering -> logging
 */
export class RequestProcessor {
  constructor(
    private stateManager: StateManager,
    private logger: RequestLogger
  ) {}

  /**
   * Process a web request through the monitoring pipeline
   * @param details Web request details
   * @param headers Optional request headers
   * @param pageMetadata Optional page metadata from content script
   */
  async processRequest(
    details: chrome.webRequest.WebRequestDetails,
    headers?: chrome.webRequest.HttpHeader[],
    pageMetadata?: PageMetadata
  ): Promise<void> {
    try {
      // Step 1: Check if monitoring is enabled
      if (!(await this.shouldMonitor(details))) {
        return;
      }

      // Step 2: Apply filtering logic
      const settings = await this.stateManager.getSettings();
      if (!shouldLogRequest(details.url, details.type, settings)) {
        return;
      }

      // Step 3: Log the request
      await this.logger.logRequest(details, headers, pageMetadata);

      console.log('Request logged:', details.url);
    } catch (error) {
      console.error('Error processing request:', error);
    }
  }

  /**
   * Check if request should be monitored based on current state
   * @param details Web request details
   * @returns true if request should be monitored
   */
  private async shouldMonitor(details: chrome.webRequest.WebRequestDetails): Promise<boolean> {
    const logData = await this.stateManager.getLogData();

    // Not monitoring
    if (!logData.isMonitoring) {
      return false;
    }

    // Check tab scope
    if (logData.monitoringScope === 'activeTab') {
      return details.tabId === logData.activeTabId;
    }

    // All tabs
    return true;
  }
}

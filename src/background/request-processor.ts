/**
 * RequestProcessor Class
 * Coordinates request processing by delegating to filter and logger
 */

import type { StateManager } from './state-manager';
import type { RequestFilter } from './request-filter';
import type { RequestLogger } from './request-logger';
import type { Settings } from '@/types';

/**
 * RequestProcessor coordinates the request handling workflow
 * Separates concerns: monitoring check -> filtering -> logging
 */
export class RequestProcessor {
  constructor(
    private stateManager: StateManager,
    private filter: RequestFilter,
    private logger: RequestLogger
  ) {}

  /**
   * Process a web request through the monitoring pipeline
   * @param details Web request details
   * @param headers Optional request headers
   */
  async processRequest(
    details: chrome.webRequest.WebRequestDetails,
    headers?: chrome.webRequest.HttpHeader[]
  ): Promise<void> {
    try {
      // Step 1: Check if monitoring is enabled
      if (!(await this.shouldMonitor(details))) {
        return;
      }

      // Step 2: Apply filtering logic
      if (!this.filter.shouldLog(details.url, details.type)) {
        return;
      }

      // Step 3: Log the request
      await this.logger.logRequest(details, headers);

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

  /**
   * Update filter with new settings
   * @param settings New settings
   */
  updateFilter(settings: Settings): void {
    this.filter.updateSettings(settings);
  }
}

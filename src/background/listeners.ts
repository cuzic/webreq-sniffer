/**
 * webRequest Listeners Module
 * Handles network request interception and logging
 */

import { getStateManager } from './storage';
import { RequestFilter } from './request-filter';
import { RequestLogger } from './request-logger';
import { RequestProcessor } from './request-processor';
import type { Settings } from '@/types';

// Global processor instance
let processor: RequestProcessor | null = null;

/**
 * Initialize the request processor
 */
function initializeProcessor(): void {
  if (processor) return;

  const stateManager = getStateManager();
  const filter = new RequestFilter({} as Settings); // Will be updated on first use
  const logger = new RequestLogger(stateManager);
  processor = new RequestProcessor(stateManager, filter, logger);

  // Initialize filter with current settings
  stateManager.getSettings().then((settings) => {
    processor?.updateFilter(settings);
  });
}

/**
 * Handle request before it's sent
 * This is where we capture and filter requests
 */
export function handleBeforeRequest(details: any): undefined {
  // Ensure processor is initialized
  initializeProcessor();

  // Process request asynchronously (don't block the request)
  processor!.processRequest(details).catch((error) => {
    console.error('Error processing request:', error);
  });

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

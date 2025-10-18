/**
 * webRequest Listeners Module
 * Handles network request interception and logging
 */

import { getStateManager } from './storage';
import { RequestFilter } from './request-filter';
import { RequestLogger } from './request-logger';
import { RequestProcessor } from './request-processor';
import { defaultSettings } from '@/types';
import type { PageMetadata } from '@/types';

// Global processor instance
let processor: RequestProcessor | null = null;

/**
 * Initialize the request processor
 */
function initializeProcessor(): void {
  if (processor) return;

  const stateManager = getStateManager();
  const filter = new RequestFilter(defaultSettings); // Use default settings initially
  const logger = new RequestLogger(stateManager);
  processor = new RequestProcessor(stateManager, filter, logger);

  // Initialize filter with current settings
  stateManager.getSettings().then((settings) => {
    processor?.updateFilter(settings);
  });
}

/**
 * Get page metadata from content script
 */
async function getPageMetadata(tabId: number): Promise<PageMetadata | undefined> {
  // Skip invalid tab IDs
  if (tabId < 0) {
    return undefined;
  }

  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: 'GET_PAGE_METADATA',
    });
    return response?.metadata;
  } catch {
    // Content script may not be loaded yet or tab may be restricted
    // This is expected for some pages (chrome://, about:, etc.)
    return undefined;
  }
}

/**
 * Handle request before it's sent
 * This is where we capture and filter requests
 */
export function handleBeforeRequest(
  details: chrome.webRequest.WebRequestDetails
): chrome.webRequest.BlockingResponse | undefined {
  // Ensure processor is initialized
  initializeProcessor();

  // Process request asynchronously (don't block the request)
  (async () => {
    try {
      // Get page metadata if tabId is available
      let pageMetadata: PageMetadata | undefined;
      if (details.tabId !== undefined && details.tabId >= 0) {
        pageMetadata = await getPageMetadata(details.tabId);
      }

      // Process request with metadata
      await processor!.processRequest(details, undefined, pageMetadata);
    } catch (error) {
      console.error('Error processing request:', error);
    }
  })();

  return undefined;
}

/**
 * Handle request headers before they're sent
 * This is where we can capture headers if needed
 */
export function handleBeforeSendHeaders(
  details: chrome.webRequest.WebRequestDetails
): chrome.webRequest.BlockingResponse | undefined {
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
  // Note: Chrome's type definitions for webRequest are imprecise
  // We use type assertions here to bridge the gap between Chrome's actual API
  // and the @types/chrome definitions
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => handleBeforeRequest(details as chrome.webRequest.WebRequestDetails),
    { urls: ['<all_urls>'] }
  );

  chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => handleBeforeSendHeaders(details as chrome.webRequest.WebRequestDetails),
    { urls: ['<all_urls>'] },
    ['requestHeaders', 'extraHeaders']
  );

  console.log('webRequest listeners registered');
}

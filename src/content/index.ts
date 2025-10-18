/**
 * Content Script Entry Point
 * Collects page metadata and responds to background script requests
 */

import { collectPageMetadata } from './metadata-collector';

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PAGE_METADATA') {
    try {
      const metadata = collectPageMetadata();
      sendResponse({ metadata });
    } catch (error) {
      console.error('Error collecting page metadata:', error);
      sendResponse({ metadata: null, error: String(error) });
    }
    return true; // Keep the message channel open for async response
  }
});

// Log that content script has loaded (for debugging)
if (process.env.NODE_ENV === 'development') {
  console.log('[WebreqSniffer] Content script loaded');
}

/**
 * Content Script Entry Point
 * Collects page metadata and responds to background script requests
 */

import { collectPageMetadata } from './metadata-collector';
import type { CustomSelector } from '@/types';
import { Logger } from '@/lib/logger';

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_PAGE_METADATA') {
    // Handle async metadata collection
    (async () => {
      try {
        // Extract custom selectors from message payload (if provided)
        const customSelectors = message.customSelectors as CustomSelector[] | undefined;

        const metadata = await collectPageMetadata(customSelectors);
        sendResponse({ metadata });
      } catch (error) {
        Logger.error('content-script', error, { context: 'collectMetadata' });
        sendResponse({ metadata: null, error: String(error) });
      }
    })();

    return true; // Keep the message channel open for async response
  }

  return false; // Synchronous response for other message types
});

// Log that content script has loaded (for debugging)
if (import.meta.env.DEV) {
  Logger.info('content-script', '[WebreqSniffer] Content script loaded', {});
}

/**
 * Shared Chrome Messaging Utilities
 * Common messaging functions for communication with Service Worker
 */

import type { Message, MessageResponse } from '@/types';

/**
 * Send message to Service Worker
 */
export async function sendMessage<T = unknown>(message: Message): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: MessageResponse) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (!response) {
        reject(new Error('No response from Service Worker'));
        return;
      }

      if (!response.success) {
        reject(new Error(response.error || 'Unknown error'));
        return;
      }

      resolve(response.data as T);
    });
  });
}

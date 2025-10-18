/**
 * Chrome Messaging Utilities for Options Page
 * Handles settings management with Service Worker
 */

import type { Message, MessageResponse, Settings } from '@/types';

/**
 * Send message to Service Worker
 */
async function sendMessage<T = unknown>(message: Message): Promise<T> {
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

/**
 * Get current settings
 */
export async function getSettings(): Promise<Settings> {
  return sendMessage({
    type: 'get-settings',
  });
}

/**
 * Update settings
 */
export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  await sendMessage({
    type: 'update-settings',
    payload: settings,
  });
}

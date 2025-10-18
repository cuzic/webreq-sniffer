/**
 * Chrome Messaging Utilities for Options Page
 * Handles settings management with Service Worker
 */

import type { Settings } from '@/types';
import { sendMessage } from '@/lib/messaging';

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

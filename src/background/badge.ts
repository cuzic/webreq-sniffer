/**
 * Badge Control Module
 * Manages extension badge for monitoring status indication
 */

import { MONITORING } from '@/lib/constants';

/**
 * Update badge to show monitoring status
 */
export async function updateBadge(isMonitoring: boolean): Promise<void> {
  if (isMonitoring) {
    await chrome.action.setBadgeText({ text: MONITORING.BADGE_TEXT });
    await chrome.action.setBadgeBackgroundColor({ color: MONITORING.BADGE_COLOR });
  } else {
    await chrome.action.setBadgeText({ text: '' });
  }
}

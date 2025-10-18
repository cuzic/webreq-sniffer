/**
 * Badge Control Module
 * Manages extension badge for monitoring status indication
 */

import { MONITORING, BADGE } from '@/lib/constants';

/**
 * Update badge to show monitoring status
 */
export async function updateBadge(isMonitoring: boolean): Promise<void> {
  if (isMonitoring) {
    await chrome.action.setBadgeText({ text: MONITORING.BADGE_TEXT });
    await chrome.action.setBadgeBackgroundColor({ color: BADGE.COLOR_MONITORING });
  } else {
    await chrome.action.setBadgeText({ text: '' });
  }
}

/**
 * Update badge to show entry count
 * Displays entry count when monitoring is active
 */
export async function updateBadgeCount(isMonitoring: boolean, entryCount: number): Promise<void> {
  if (isMonitoring) {
    // Format count for badge (max 4 characters)
    let badgeText: string;
    if (entryCount >= BADGE.THRESHOLD_10K) {
      badgeText = Math.floor(entryCount / BADGE.THRESHOLD_K) + 'k';
    } else if (entryCount >= BADGE.THRESHOLD_K) {
      badgeText = (entryCount / BADGE.THRESHOLD_K).toFixed(1) + 'k';
    } else {
      badgeText = entryCount.toString();
    }

    await chrome.action.setBadgeText({ text: badgeText });
    await chrome.action.setBadgeBackgroundColor({ color: BADGE.COLOR_MONITORING });
  } else {
    await chrome.action.setBadgeText({ text: '' });
  }
}

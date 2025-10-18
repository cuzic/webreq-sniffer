/**
 * Badge Control Module
 * Manages extension badge for monitoring status indication
 */

/**
 * Update badge to show monitoring status
 */
export async function updateBadge(isMonitoring: boolean): Promise<void> {
  if (isMonitoring) {
    await chrome.action.setBadgeText({ text: 'REC' });
    await chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  } else {
    await chrome.action.setBadgeText({ text: '' });
  }
}

/**
 * Clear badge
 */
export async function clearBadge(): Promise<void> {
  await chrome.action.setBadgeText({ text: '' });
}

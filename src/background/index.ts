/**
 * Service Worker for WebreqSniffer
 * Manifest V3 background script
 */

import { initializeStorage } from './storage';
import { handleMessage } from './messages';
import { registerWebRequestListeners } from './listeners';

// Import types for type checking
import '@/types';

console.log('WebreqSniffer Service Worker loaded');

// ========================================
// Installation and Setup
// ========================================

/**
 * Initialize default settings on installation
 */
chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {
  console.log('WebreqSniffer extension installed', details.reason);

  if (details.reason === 'install') {
    // First install: set default settings and log data
    await initializeStorage();
    console.log('Default settings initialized');
  } else if (details.reason === 'update') {
    // Extension updated: migrate settings if needed
    console.log('Extension updated');
  }
});

// ========================================
// Message Handling
// ========================================

/**
 * Handle messages from Popup and Options pages
 */
chrome.runtime.onMessage.addListener(handleMessage);

// ========================================
// webRequest Listeners
// ========================================

/**
 * Register webRequest listeners for network monitoring
 */
registerWebRequestListeners();

console.log('Service Worker initialized: all handlers registered');

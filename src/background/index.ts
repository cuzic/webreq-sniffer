/**
 * Service Worker for WebreqSniffer
 * Manifest V3 background script
 */

import { initializeStorage } from './storage';
import { handleMessage } from './messages';
import { registerWebRequestListeners } from './listeners';
import { stateEmitter } from '@/lib/state-change-emitter';

// Import types for type checking
import '@/types';

// ========================================
// Installation and Setup
// ========================================

/**
 * Initialize default settings on installation
 */
chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {
  if (details.reason === 'install') {
    // First install: set default settings and log data
    await initializeStorage();
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

// ========================================
// Storage Change Listener (Observer Pattern)
// ========================================

/**
 * Listen for storage changes and emit events
 * Enables real-time UI updates without polling
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  // Emit specific events based on what changed
  if (areaName === 'local' && changes.logData) {
    stateEmitter.emit('logData:changed');
  }

  if (areaName === 'sync' && changes.settings) {
    stateEmitter.emit('settings:changed');
  }
});

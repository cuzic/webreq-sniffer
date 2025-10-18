/**
 * Service Worker Verification Test
 * This test verifies that the Service Worker is properly implemented
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const backgroundPath = join(projectRoot, 'src/background/index.ts');
const messagesPath = join(projectRoot, 'src/background/messages.ts');
const storagePath = join(projectRoot, 'src/background/storage.ts');
const badgePath = join(projectRoot, 'src/background/badge.ts');
const listenersPath = join(projectRoot, 'src/background/listeners.ts');

// Simple test framework
function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    process.exit(1);
  }
}

function expect(actual) {
  return {
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value but got ${actual}`);
      }
    },
    toContain(expected) {
      if (typeof actual === 'string' && !actual.includes(expected)) {
        throw new Error(`Expected to contain "${expected}"`);
      }
    },
  };
}

console.log('Running Service Worker verification tests...\n');

// Test 1: Service Worker file exists
test('src/background/index.ts should exist', () => {
  expect(existsSync(backgroundPath)).toBeTruthy();
});

// Test 2: File content checks
const content = readFileSync(backgroundPath, 'utf-8');
const messagesContent = readFileSync(messagesPath, 'utf-8');
const storageContent = readFileSync(storagePath, 'utf-8');
const badgeContent = readFileSync(badgePath, 'utf-8');
const listenersContent = readFileSync(listenersPath, 'utf-8');

test('should import chrome types', () => {
  // Chrome API is available globally, no explicit import needed
  // but we should use it in the code
  expect(content).toContain('chrome.');
});

test('should have runtime.onMessage listener', () => {
  expect(content).toContain('chrome.runtime.onMessage');
});

test('should have runtime.onInstalled listener', () => {
  expect(content).toContain('chrome.runtime.onInstalled');
});

test('should import types from @/types', () => {
  expect(content).toContain('@/types');
});

test('should handle start-monitoring message', () => {
  expect(messagesContent).toContain('start-monitoring');
});

test('should handle stop-monitoring message', () => {
  expect(messagesContent).toContain('stop-monitoring');
});

test('should handle get-status message', () => {
  expect(messagesContent).toContain('get-status');
});

test('should handle clear-logs message', () => {
  expect(messagesContent).toContain('clear-logs');
});

test('should use chrome.storage.local', () => {
  expect(storageContent).toContain('chrome.storage');
});

test('should use chrome.action.setBadgeText for monitoring indicator', () => {
  expect(badgeContent).toContain('chrome.action.setBadgeText');
});

// Phase 2 Tests: webRequest listeners and filtering
test('should have webRequest.onBeforeRequest listener', () => {
  expect(listenersContent).toContain('chrome.webRequest.onBeforeRequest');
});

test('should have webRequest.onBeforeSendHeaders listener', () => {
  expect(listenersContent).toContain('chrome.webRequest.onBeforeSendHeaders');
});

test('should have filtering logic module', () => {
  const filteringPath = join(projectRoot, 'src/background/filtering.ts');
  expect(existsSync(filteringPath)).toBeTruthy();
});

test('should have logging logic module', () => {
  const loggingPath = join(projectRoot, 'src/background/logging.ts');
  expect(existsSync(loggingPath)).toBeTruthy();
});

// Phase 3 Tests: Export functionality
test('should have export module', () => {
  const exportPath = join(projectRoot, 'src/background/export.ts');
  expect(existsSync(exportPath)).toBeTruthy();
});

test('should handle export-logs message', () => {
  expect(messagesContent).toContain('export-logs');
});

console.log('\n✓ All Service Worker verification tests passed!');

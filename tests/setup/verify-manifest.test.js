/**
 * Setup Verification Test: manifest.json
 * This test verifies that manifest.json is properly configured for Manifest V3
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const manifestPath = join(projectRoot, 'manifest.json');

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
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value but got ${actual}`);
      }
    },
    toContain(expected) {
      if (Array.isArray(actual)) {
        if (!actual.includes(expected)) {
          throw new Error(`Expected array to contain "${expected}"`);
        }
      } else if (typeof actual === 'string') {
        if (!actual.includes(expected)) {
          throw new Error(`Expected to contain "${expected}"`);
        }
      }
    },
    toHaveProperty(prop) {
      if (!(prop in actual)) {
        throw new Error(`Expected to have property ${prop}`);
      }
    },
  };
}

console.log('Running manifest.json verification tests...\n');

// Test 1: manifest.json exists
test('manifest.json should exist', () => {
  expect(existsSync(manifestPath)).toBeTruthy();
});

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

// Test 2: Manifest V3
test('manifest_version should be 3', () => {
  expect(manifest.manifest_version).toBe(3);
});

// Test 3: Basic metadata
test('should have name, version, and description', () => {
  expect(manifest).toHaveProperty('name');
  expect(manifest).toHaveProperty('version');
  expect(manifest).toHaveProperty('description');
});

test('name should be WebreqSniffer', () => {
  expect(manifest.name).toBe('WebreqSniffer');
});

// Test 4: Permissions
test('should have permissions array', () => {
  expect(manifest).toHaveProperty('permissions');
  expect(Array.isArray(manifest.permissions)).toBeTruthy();
});

test('permissions should include webRequest', () => {
  expect(manifest.permissions).toContain('webRequest');
});

test('permissions should include storage', () => {
  expect(manifest.permissions).toContain('storage');
});

test('permissions should include downloads', () => {
  expect(manifest.permissions).toContain('downloads');
});

test('permissions should include activeTab', () => {
  expect(manifest.permissions).toContain('activeTab');
});

test('permissions should include unlimitedStorage', () => {
  expect(manifest.permissions).toContain('unlimitedStorage');
});

// Test 5: Host permissions
test('should have host_permissions array', () => {
  expect(manifest).toHaveProperty('host_permissions');
  expect(Array.isArray(manifest.host_permissions)).toBeTruthy();
});

test('host_permissions should include <all_urls>', () => {
  expect(manifest.host_permissions).toContain('<all_urls>');
});

// Test 6: Background service worker
test('should have background configuration', () => {
  expect(manifest).toHaveProperty('background');
});

test('background should have service_worker', () => {
  expect(manifest.background).toHaveProperty('service_worker');
});

test('background service_worker should point to valid path', () => {
  expect(manifest.background.service_worker).toContain('background');
});

test('background type should be module', () => {
  expect(manifest.background.type).toBe('module');
});

// Test 7: Action (popup)
test('should have action configuration', () => {
  expect(manifest).toHaveProperty('action');
});

test('action should have default_popup', () => {
  expect(manifest.action).toHaveProperty('default_popup');
  expect(manifest.action.default_popup).toContain('popup.html');
});

test('action should have default_title', () => {
  expect(manifest.action).toHaveProperty('default_title');
});

// Test 8: Options page
test('should have options_page', () => {
  expect(manifest).toHaveProperty('options_page');
  expect(manifest.options_page).toContain('options.html');
});

// Test 9: Icons
test('should have icons', () => {
  expect(manifest).toHaveProperty('icons');
});

test('icons should have 16x16', () => {
  expect(manifest.icons).toHaveProperty('16');
});

test('icons should have 48x48', () => {
  expect(manifest.icons).toHaveProperty('48');
});

test('icons should have 128x128', () => {
  expect(manifest.icons).toHaveProperty('128');
});

// Test 10: Incognito mode
test('incognito mode should be split', () => {
  expect(manifest.incognito).toBe('split');
});

console.log('\n✓ All manifest.json verification tests passed!');

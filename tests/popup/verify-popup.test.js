/**
 * Popup UI Verification Test
 * This test verifies that the Popup UI is properly implemented
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const popupHtmlPath = join(projectRoot, 'src/popup/popup.html');
const popupTsxPath = join(projectRoot, 'src/popup/index.tsx');
const popupComponentPath = join(projectRoot, 'src/popup/Popup.tsx');
const messagingPath = join(projectRoot, 'src/popup/messaging.ts');

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

console.log('Running Popup UI verification tests...\n');

// Test 1: Popup HTML file exists
test('src/popup/popup.html should exist', () => {
  expect(existsSync(popupHtmlPath)).toBeTruthy();
});

// Test 2: Popup entry point exists
test('src/popup/index.tsx should exist', () => {
  expect(existsSync(popupTsxPath)).toBeTruthy();
});

// Test 3: Popup component exists
test('src/popup/Popup.tsx should exist', () => {
  expect(existsSync(popupComponentPath)).toBeTruthy();
});

// Test 4: Messaging utilities exist
test('src/popup/messaging.ts should exist', () => {
  expect(existsSync(messagingPath)).toBeTruthy();
});

// Read file contents for deeper checks
if (existsSync(popupHtmlPath)) {
  const htmlContent = readFileSync(popupHtmlPath, 'utf-8');

  test('popup.html should have root div', () => {
    expect(htmlContent).toContain('id="root"');
  });

  test('popup.html should load the popup script', () => {
    expect(htmlContent).toContain('index.tsx');
  });
}

if (existsSync(popupTsxPath)) {
  const tsxContent = readFileSync(popupTsxPath, 'utf-8');

  test('popup index.tsx should import React', () => {
    expect(tsxContent).toContain('react');
  });

  test('popup index.tsx should create React root', () => {
    expect(tsxContent).toContain('createRoot');
  });
}

if (existsSync(popupComponentPath)) {
  const componentContent = readFileSync(popupComponentPath, 'utf-8');

  test('Popup.tsx should export Popup component', () => {
    expect(componentContent).toContain('export');
    expect(componentContent).toContain('Popup');
  });
}

if (existsSync(messagingPath)) {
  const messagingContent = readFileSync(messagingPath, 'utf-8');

  test('messaging.ts should import sendMessage', () => {
    expect(messagingContent).toContain('sendMessage');
  });

  test('messaging.ts should import from lib/messaging', () => {
    expect(messagingContent).toContain('@/lib/messaging');
  });
}

console.log('\n✓ All Popup UI verification tests passed!');

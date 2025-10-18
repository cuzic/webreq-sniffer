/**
 * Options Page Verification Test
 * This test verifies that the Options Page is properly implemented
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const optionsHtmlPath = join(projectRoot, 'src/options/options.html');
const optionsTsxPath = join(projectRoot, 'src/options/options.tsx');
const optionsComponentPath = join(projectRoot, 'src/options/Options.tsx');
const messagingPath = join(projectRoot, 'src/options/messaging.ts');

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

console.log('Running Options Page verification tests...\n');

// Test 1: Options HTML file exists
test('src/options/options.html should exist', () => {
  expect(existsSync(optionsHtmlPath)).toBeTruthy();
});

// Test 2: Options entry point exists
test('src/options/options.tsx should exist', () => {
  expect(existsSync(optionsTsxPath)).toBeTruthy();
});

// Test 3: Options component exists
test('src/options/Options.tsx should exist', () => {
  expect(existsSync(optionsComponentPath)).toBeTruthy();
});

// Test 4: Messaging utilities exist
test('src/options/messaging.ts should exist', () => {
  expect(existsSync(messagingPath)).toBeTruthy();
});

// Read file contents for deeper checks
if (existsSync(optionsHtmlPath)) {
  const htmlContent = readFileSync(optionsHtmlPath, 'utf-8');

  test('options.html should have root div', () => {
    expect(htmlContent).toContain('id="root"');
  });

  test('options.html should load the options script', () => {
    expect(htmlContent).toContain('options.tsx');
  });
}

if (existsSync(optionsTsxPath)) {
  const tsxContent = readFileSync(optionsTsxPath, 'utf-8');

  test('options.tsx should import React', () => {
    expect(tsxContent).toContain('react');
  });

  test('options.tsx should create React root', () => {
    expect(tsxContent).toContain('createRoot');
  });
}

if (existsSync(optionsComponentPath)) {
  const componentContent = readFileSync(optionsComponentPath, 'utf-8');

  test('Options.tsx should export Options component', () => {
    expect(componentContent).toContain('export');
    expect(componentContent).toContain('Options');
  });
}

if (existsSync(messagingPath)) {
  const messagingContent = readFileSync(messagingPath, 'utf-8');

  test('messaging.ts should have getSettings function', () => {
    expect(messagingContent).toContain('getSettings');
  });

  test('messaging.ts should have updateSettings function', () => {
    expect(messagingContent).toContain('updateSettings');
  });
}

console.log('\n✓ All Options Page verification tests passed!');

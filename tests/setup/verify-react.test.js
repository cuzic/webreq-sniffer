/**
 * Setup Verification Test: React Configuration
 * This test verifies that React is properly installed and configured
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const packageJsonPath = join(projectRoot, 'package.json');
const popupPath = join(projectRoot, 'src/popup/popup.tsx');
const optionsPath = join(projectRoot, 'src/options/options.tsx');

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
      if (typeof actual === 'string' && !actual.includes(expected)) {
        throw new Error(`Expected to contain "${expected}"`);
      }
    },
    toHaveProperty(prop) {
      if (!(prop in actual)) {
        throw new Error(`Expected to have property ${prop}`);
      }
    },
  };
}

console.log('Running React configuration tests...\n');

// Test 1: package.json has react dependency
test('package.json should have react as dependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.dependencies).toHaveProperty('react');
});

// Test 2: package.json has react-dom dependency
test('package.json should have react-dom as dependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.dependencies).toHaveProperty('react-dom');
});

// Test 3: package.json has @types/react devDependency
test('package.json should have @types/react as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('@types/react');
});

// Test 4: package.json has @types/react-dom devDependency
test('package.json should have @types/react-dom as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('@types/react-dom');
});

// Test 5: popup.tsx exists
test('src/popup/popup.tsx should exist', () => {
  expect(existsSync(popupPath)).toBeTruthy();
});

// Test 6: popup.tsx imports React
test('popup.tsx should import React', () => {
  const content = readFileSync(popupPath, 'utf-8');
  expect(content).toContain('react');
});

// Test 7: options.tsx exists
test('src/options/options.tsx should exist', () => {
  expect(existsSync(optionsPath)).toBeTruthy();
});

// Test 8: options.tsx imports React
test('options.tsx should import React', () => {
  const content = readFileSync(optionsPath, 'utf-8');
  expect(content).toContain('react');
});

console.log('\n✓ All React configuration tests passed!');

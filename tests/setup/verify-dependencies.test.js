/**
 * Setup Verification Test: Additional Dependencies
 * This test verifies that all additional dependencies are properly installed
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const packageJsonPath = join(projectRoot, 'package.json');

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
    toHaveProperty(prop) {
      if (!(prop in actual)) {
        throw new Error(`Expected to have property ${prop}`);
      }
    },
  };
}

console.log('Running additional dependencies verification tests...\n');

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Test 1: Zustand
test('package.json should have zustand as dependency', () => {
  expect(packageJson.dependencies).toHaveProperty('zustand');
});

// Test 2: Zod
test('package.json should have zod as dependency', () => {
  expect(packageJson.dependencies).toHaveProperty('zod');
});

// Test 3: Dexie
test('package.json should have dexie as dependency', () => {
  expect(packageJson.dependencies).toHaveProperty('dexie');
});

// Test 4: webextension-polyfill
test('package.json should have webextension-polyfill as dependency', () => {
  expect(packageJson.dependencies).toHaveProperty('webextension-polyfill');
});

// Test 5: @types/webextension-polyfill
test('package.json should have @types/webextension-polyfill as devDependency', () => {
  expect(packageJson.devDependencies).toHaveProperty('@types/webextension-polyfill');
});

// Test 6: Lodash
test('package.json should have lodash as dependency', () => {
  expect(packageJson.dependencies).toHaveProperty('lodash');
});

// Test 7: @types/lodash
test('package.json should have @types/lodash as devDependency', () => {
  expect(packageJson.devDependencies).toHaveProperty('@types/lodash');
});

// Test 8: i18next
test('package.json should have i18next as dependency', () => {
  expect(packageJson.dependencies).toHaveProperty('i18next');
});

// Test 9: react-i18next
test('package.json should have react-i18next as dependency', () => {
  expect(packageJson.dependencies).toHaveProperty('react-i18next');
});

console.log('\n✓ All additional dependencies verification tests passed!');

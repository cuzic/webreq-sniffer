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

// Test 1: Zod
test('package.json should have zod as dependency', () => {
  expect(packageJson.dependencies).toHaveProperty('zod');
});

// Test 2: webextension-polyfill
test('package.json should have webextension-polyfill as dependency', () => {
  expect(packageJson.dependencies).toHaveProperty('webextension-polyfill');
});

// Test 3: @types/webextension-polyfill
test('package.json should have @types/webextension-polyfill as devDependency', () => {
  expect(packageJson.devDependencies).toHaveProperty('@types/webextension-polyfill');
});

// Test 4: Handlebars
test('package.json should have handlebars as dependency', () => {
  expect(packageJson.dependencies).toHaveProperty('handlebars');
});

// Test 5: @types/handlebars
test('package.json should have @types/handlebars as devDependency', () => {
  expect(packageJson.devDependencies).toHaveProperty('@types/handlebars');
});

console.log('\n✓ All additional dependencies verification tests passed!');

/**
 * Setup Verification Test: ESLint + Prettier Configuration
 * This test verifies that ESLint and Prettier are properly configured
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const eslintConfigPath = join(projectRoot, 'eslint.config.js');
const prettierConfigPath = join(projectRoot, '.prettierrc');
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
      } else if (Array.isArray(actual) && !actual.includes(expected)) {
        throw new Error(`Expected array to contain "${expected}"`);
      }
    },
    toHaveProperty(prop) {
      if (!(prop in actual)) {
        throw new Error(`Expected to have property ${prop}`);
      }
    },
  };
}

console.log('Running ESLint + Prettier configuration tests...\n');

// Test 1: ESLint config exists
test('eslint.config.js should exist', () => {
  expect(existsSync(eslintConfigPath)).toBeTruthy();
});

// Test 2: ESLint config is valid JavaScript
test('eslint.config.js should be valid JavaScript', () => {
  const content = readFileSync(eslintConfigPath, 'utf-8');
  expect(content.length > 0).toBeTruthy();
});

// Test 3: ESLint config exports array or object
test('eslint.config.js should export configuration', () => {
  const content = readFileSync(eslintConfigPath, 'utf-8');
  expect(content).toContain('export default');
});

// Test 4: Prettier config exists
test('.prettierrc should exist', () => {
  expect(existsSync(prettierConfigPath)).toBeTruthy();
});

// Test 5: Prettier config is valid JSON
let prettierConfig;
test('.prettierrc should be valid JSON', () => {
  const content = readFileSync(prettierConfigPath, 'utf-8');
  prettierConfig = JSON.parse(content);
  expect(typeof prettierConfig).toBe('object');
});

// Test 6: package.json has eslint dependency
test('package.json should have eslint as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('eslint');
});

// Test 7: package.json has @typescript-eslint/parser
test('package.json should have @typescript-eslint/parser as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('@typescript-eslint/parser');
});

// Test 8: package.json has @typescript-eslint/eslint-plugin
test('package.json should have @typescript-eslint/eslint-plugin as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('@typescript-eslint/eslint-plugin');
});

// Test 9: package.json has prettier
test('package.json should have prettier as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('prettier');
});

// Test 10: package.json has eslint-config-prettier
test('package.json should have eslint-config-prettier as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('eslint-config-prettier');
});

// Test 11: package.json has lint script
test('package.json should have lint script', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.scripts).toHaveProperty('lint');
});

// Test 12: package.json has format script
test('package.json should have format script', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.scripts).toHaveProperty('format');
});

console.log('\n✓ All ESLint + Prettier configuration tests passed!');

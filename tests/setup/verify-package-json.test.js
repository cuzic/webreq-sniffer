/**
 * Setup Verification Test: package.json
 * This test verifies that package.json exists and has the required configuration
 */

import { readFileSync, existsSync } from 'fs';
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
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value but got ${actual}`);
      }
    },
    toContain(expected) {
      if (!actual.includes(expected)) {
        throw new Error(`Expected to contain ${expected}`);
      }
    },
    toHaveProperty(prop) {
      if (!(prop in actual)) {
        throw new Error(`Expected to have property ${prop}`);
      }
    }
  };
}

console.log('Running package.json verification tests...\n');

// Test 1: package.json exists
test('package.json should exist', () => {
  expect(existsSync(packageJsonPath)).toBeTruthy();
});

// Test 2: package.json is valid JSON
let packageJson;
test('package.json should be valid JSON', () => {
  const content = readFileSync(packageJsonPath, 'utf-8');
  packageJson = JSON.parse(content);
  expect(typeof packageJson).toBe('object');
});

// Test 3: Required fields exist
test('package.json should have required fields', () => {
  expect(packageJson).toHaveProperty('name');
  expect(packageJson).toHaveProperty('version');
  expect(packageJson).toHaveProperty('description');
  expect(packageJson).toHaveProperty('scripts');
});

// Test 4: Name should be correct
test('package.json name should be "webreq-sniffer"', () => {
  expect(packageJson.name).toBe('webreq-sniffer');
});

// Test 5: Type should be module
test('package.json should use ES modules', () => {
  expect(packageJson.type).toBe('module');
});

// Test 6: Should have dev script
test('package.json should have dev script', () => {
  expect(packageJson.scripts).toHaveProperty('dev');
});

// Test 7: Should have build script
test('package.json should have build script', () => {
  expect(packageJson.scripts).toHaveProperty('build');
});

console.log('\n✓ All tests passed!');

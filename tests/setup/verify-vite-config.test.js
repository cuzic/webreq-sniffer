/**
 * Setup Verification Test: Vite + CRXJS Configuration
 * This test verifies that Vite and CRXJS are properly configured
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const viteConfigPath = join(projectRoot, 'vite.config.js');
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
      if (!actual.includes(expected)) {
        throw new Error(`Expected to contain "${expected}"`);
      }
    },
    toHaveProperty(prop) {
      if (!(prop in actual)) {
        throw new Error(`Expected to have property ${prop}`);
      }
    }
  };
}

console.log('Running Vite + CRXJS configuration tests...\n');

// Test 1: vite.config.js exists
test('vite.config.js should exist', () => {
  expect(existsSync(viteConfigPath)).toBeTruthy();
});

// Test 2: vite.config.js contains CRXJS plugin import
test('vite.config.js should import @crxjs/vite-plugin', () => {
  const content = readFileSync(viteConfigPath, 'utf-8');
  expect(content).toContain('@crxjs/vite-plugin');
});

// Test 3: vite.config.js uses crx plugin
test('vite.config.js should use crx() plugin', () => {
  const content = readFileSync(viteConfigPath, 'utf-8');
  expect(content).toContain('crx(');
});

// Test 4: vite.config.js references manifest
test('vite.config.js should reference manifest', () => {
  const content = readFileSync(viteConfigPath, 'utf-8');
  expect(content).toContain('manifest');
});

// Test 5: package.json has vite dependency
test('package.json should have vite as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('vite');
});

// Test 6: package.json has @crxjs/vite-plugin dependency
test('package.json should have @crxjs/vite-plugin as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('@crxjs/vite-plugin');
});

// Test 7: vite.config.js exports default configuration
test('vite.config.js should export default configuration', () => {
  const content = readFileSync(viteConfigPath, 'utf-8');
  expect(content).toContain('export default');
});

console.log('\n✓ All Vite configuration tests passed!');

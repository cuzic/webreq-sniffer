/**
 * Setup Verification Test: husky + lint-staged Configuration
 * This test verifies that Git hooks are properly configured
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const huskyDir = join(projectRoot, '.husky');
const preCommitPath = join(huskyDir, 'pre-commit');
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
      }
    },
    toHaveProperty(prop) {
      if (!(prop in actual)) {
        throw new Error(`Expected to have property ${prop}`);
      }
    },
  };
}

console.log('Running husky + lint-staged configuration tests...\n');

// Test 1: .husky directory exists
test('.husky directory should exist', () => {
  expect(existsSync(huskyDir)).toBeTruthy();
});

// Test 2: pre-commit hook exists
test('.husky/pre-commit should exist', () => {
  expect(existsSync(preCommitPath)).toBeTruthy();
});

// Test 3: pre-commit contains npx lint-staged
test('.husky/pre-commit should run lint-staged', () => {
  const content = readFileSync(preCommitPath, 'utf-8');
  expect(content).toContain('npx lint-staged');
});

// Test 4: package.json has husky dependency
test('package.json should have husky as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('husky');
});

// Test 5: package.json has lint-staged dependency
test('package.json should have lint-staged as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('lint-staged');
});

// Test 6: package.json has lint-staged configuration
test('package.json should have lint-staged configuration', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson).toHaveProperty('lint-staged');
});

// Test 7: lint-staged config includes TypeScript files
test('lint-staged should handle TypeScript files', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const lintStaged = packageJson['lint-staged'];
  const hasTs =
    lintStaged &&
    (lintStaged['*.ts'] ||
      lintStaged['*.{ts,tsx}'] ||
      lintStaged['**/*.{ts,tsx}'] ||
      lintStaged['src/**/*.{ts,tsx}']);
  if (!hasTs) {
    throw new Error('lint-staged config should include TypeScript file patterns');
  }
});

// Test 8: package.json has prepare script
test('package.json should have prepare script for husky', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.scripts).toHaveProperty('prepare');
});

console.log('\n✓ All husky + lint-staged configuration tests passed!');

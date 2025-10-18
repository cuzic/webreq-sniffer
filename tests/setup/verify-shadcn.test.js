/**
 * Setup Verification Test: shadcn/ui Configuration
 * This test verifies that shadcn/ui is properly installed and configured
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const packageJsonPath = join(projectRoot, 'package.json');
const componentsJsonPath = join(projectRoot, 'components.json');
const utilsPath = join(projectRoot, 'src/lib/utils.ts');
const tsconfigPath = join(projectRoot, 'tsconfig.json');
const viteConfigPath = join(projectRoot, 'vite.config.js');

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

console.log('Running shadcn/ui configuration tests...\n');

// Test 1: package.json has class-variance-authority
test('package.json should have class-variance-authority as dependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.dependencies).toHaveProperty('class-variance-authority');
});

// Test 2: package.json has clsx
test('package.json should have clsx as dependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.dependencies).toHaveProperty('clsx');
});

// Test 3: package.json has tailwind-merge
test('package.json should have tailwind-merge as dependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.dependencies).toHaveProperty('tailwind-merge');
});

// Test 4: package.json has lucide-react
test('package.json should have lucide-react as dependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.dependencies).toHaveProperty('lucide-react');
});

// Test 5: components.json exists
test('components.json should exist', () => {
  expect(existsSync(componentsJsonPath)).toBeTruthy();
});

// Test 6: components.json is valid JSON
test('components.json should be valid JSON', () => {
  const content = readFileSync(componentsJsonPath, 'utf-8');
  JSON.parse(content); // Will throw if invalid
});

// Test 7: src/lib/utils.ts exists
test('src/lib/utils.ts should exist', () => {
  expect(existsSync(utilsPath)).toBeTruthy();
});

// Test 8: utils.ts exports cn function
test('utils.ts should export cn function', () => {
  const content = readFileSync(utilsPath, 'utf-8');
  expect(content).toContain('export function cn');
});

// Test 9: tsconfig.json has path alias
test('tsconfig.json should have @/* path alias', () => {
  const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
  expect(tsconfig.compilerOptions.paths).toHaveProperty('@/*');
});

// Test 10: vite.config.js has path alias resolver
test('vite.config.js should have path alias resolver', () => {
  const content = readFileSync(viteConfigPath, 'utf-8');
  expect(content).toContain('resolve');
  expect(content).toContain('alias');
});

console.log('\n✓ All shadcn/ui configuration tests passed!');

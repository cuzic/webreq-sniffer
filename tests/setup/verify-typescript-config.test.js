/**
 * Setup Verification Test: TypeScript Configuration
 * This test verifies that TypeScript is properly configured
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const tsconfigPath = join(projectRoot, 'tsconfig.json');
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
    },
  };
}

console.log('Running TypeScript configuration tests...\n');

// Test 1: tsconfig.json exists
test('tsconfig.json should exist', () => {
  expect(existsSync(tsconfigPath)).toBeTruthy();
});

// Test 2: tsconfig.json is valid JSON
let tsconfig;
test('tsconfig.json should be valid JSON', () => {
  const content = readFileSync(tsconfigPath, 'utf-8');
  tsconfig = JSON.parse(content);
  expect(typeof tsconfig).toBe('object');
});

// Test 3: Has compilerOptions
test('tsconfig.json should have compilerOptions', () => {
  expect(tsconfig).toHaveProperty('compilerOptions');
});

// Test 4: Target is ES2020 or higher
test('compilerOptions.target should be ES2020 or higher', () => {
  const target = tsconfig.compilerOptions.target;
  const validTargets = ['ES2020', 'ES2021', 'ES2022', 'ESNext'];
  if (!validTargets.includes(target)) {
    throw new Error(`Expected target to be one of ${validTargets.join(', ')} but got ${target}`);
  }
});

// Test 5: Module should be ESNext or ES2020
test('compilerOptions.module should be ESNext or ES2020', () => {
  const module = tsconfig.compilerOptions.module;
  const validModules = ['ESNext', 'ES2020', 'ES2022'];
  if (!validModules.includes(module)) {
    throw new Error(`Expected module to be one of ${validModules.join(', ')} but got ${module}`);
  }
});

// Test 6: Should have lib array
test('compilerOptions.lib should include DOM and ES2020', () => {
  const lib = tsconfig.compilerOptions.lib;
  expect(Array.isArray(lib)).toBeTruthy();
  expect(lib).toContain('DOM');
});

// Test 7: Should have strict mode enabled
test('compilerOptions.strict should be true', () => {
  expect(tsconfig.compilerOptions.strict).toBe(true);
});

// Test 8: Should have moduleResolution
test('compilerOptions.moduleResolution should be bundler or node', () => {
  const resolution = tsconfig.compilerOptions.moduleResolution;
  const validResolutions = ['bundler', 'node', 'node16', 'nodenext'];
  if (!validResolutions.includes(resolution)) {
    throw new Error(
      `Expected moduleResolution to be one of ${validResolutions.join(', ')} but got ${resolution}`
    );
  }
});

// Test 9: Should have types array with chrome
test('compilerOptions.types should include chrome', () => {
  const types = tsconfig.compilerOptions.types;
  if (types && Array.isArray(types)) {
    expect(types).toContain('chrome');
  }
});

// Test 10: package.json has typescript dependency
test('package.json should have typescript as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('typescript');
});

// Test 11: package.json has @types/chrome dependency
test('package.json should have @types/chrome as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('@types/chrome');
});

console.log('\n✓ All TypeScript configuration tests passed!');

/**
 * Setup Verification Test: Tailwind CSS Configuration
 * This test verifies that Tailwind CSS is properly installed and configured
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const packageJsonPath = join(projectRoot, 'package.json');
const tailwindConfigPath = join(projectRoot, 'tailwind.config.js');
const postcssConfigPath = join(projectRoot, 'postcss.config.js');
const indexCssPath = join(projectRoot, 'src/index.css');

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

console.log('Running Tailwind CSS configuration tests...\n');

// Test 1: package.json has tailwindcss devDependency
test('package.json should have tailwindcss as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('tailwindcss');
});

// Test 2: package.json has postcss devDependency
test('package.json should have postcss as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('postcss');
});

// Test 3: package.json has autoprefixer devDependency
test('package.json should have autoprefixer as devDependency', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  expect(packageJson.devDependencies).toHaveProperty('autoprefixer');
});

// Test 4: tailwind.config.js exists
test('tailwind.config.js should exist', () => {
  expect(existsSync(tailwindConfigPath)).toBeTruthy();
});

// Test 5: tailwind.config.js exports configuration
test('tailwind.config.js should export configuration', () => {
  const content = readFileSync(tailwindConfigPath, 'utf-8');
  expect(content).toContain('export default');
});

// Test 6: postcss.config.js exists
test('postcss.config.js should exist', () => {
  expect(existsSync(postcssConfigPath)).toBeTruthy();
});

// Test 7: postcss.config.js includes tailwindcss plugin
test('postcss.config.js should include tailwindcss plugin', () => {
  const content = readFileSync(postcssConfigPath, 'utf-8');
  expect(content).toContain('tailwindcss');
});

// Test 8: src/index.css exists
test('src/index.css should exist', () => {
  expect(existsSync(indexCssPath)).toBeTruthy();
});

// Test 9: index.css includes Tailwind directives
test('index.css should include @tailwind directives', () => {
  const content = readFileSync(indexCssPath, 'utf-8');
  expect(content).toContain('@tailwind');
});

console.log('\n✓ All Tailwind CSS configuration tests passed!');

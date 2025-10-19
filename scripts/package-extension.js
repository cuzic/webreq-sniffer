#!/usr/bin/env node

/**
 * Package Chrome Extension
 * Creates a zip file of the built extension for distribution
 */

import { createWriteStream, existsSync, readFileSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import archiver from 'archiver';

// Get version from package.json
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const version = packageJson.version;

// Configuration
const DIST_DIR = './dist';
const OUTPUT_DIR = './packages';
const OUTPUT_FILE = `webreq-sniffer-v${version}.zip`;

// Files and directories to exclude
const EXCLUDE_PATTERNS = ['.vite', '.DS_Store', 'Thumbs.db', '*.map', '*.log'];

/**
 * Check if path should be excluded
 */
function shouldExclude(path) {
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.startsWith('*.')) {
      // File extension pattern
      const ext = pattern.slice(1);
      if (path.endsWith(ext)) {
        return true;
      }
    } else if (path.includes(pattern)) {
      // Directory or file name pattern
      return true;
    }
  }
  return false;
}

/**
 * Recursively add directory to archive
 */
async function addDirectoryToArchive(archive, dirPath, baseDir) {
  const entries = await readdir(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const relativePath = relative(baseDir, fullPath);

    if (shouldExclude(relativePath)) {
      console.log(`  ⊘ Excluding: ${relativePath}`);
      continue;
    }

    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      await addDirectoryToArchive(archive, fullPath, baseDir);
    } else if (stats.isFile()) {
      archive.file(fullPath, { name: relativePath });
      console.log(`  + ${relativePath}`);
    }
  }
}

/**
 * Main packaging function
 */
async function packageExtension() {
  console.log('🎁 Packaging Chrome Extension...\n');

  // Check if dist directory exists
  if (!existsSync(DIST_DIR)) {
    console.error('❌ Error: dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Create packages directory if it doesn't exist
  const { mkdir } = await import('node:fs/promises');
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
  } catch {
    // Ignore error if directory already exists
  }

  const outputPath = join(OUTPUT_DIR, OUTPUT_FILE);

  console.log(`📦 Creating package: ${outputPath}`);
  console.log(`📋 Version: ${version}\n`);

  // Create archive
  const output = createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Maximum compression
  });

  // Handle archive events
  output.on('close', () => {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`\n✅ Package created successfully!`);
    console.log(`   Size: ${sizeInMB} MB`);
    console.log(`   Path: ${outputPath}`);
  });

  archive.on('error', (err) => {
    console.error('❌ Error creating archive:', err);
    process.exit(1);
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('⚠️  Warning:', err);
    } else {
      throw err;
    }
  });

  // Pipe archive to output file
  archive.pipe(output);

  // Add files to archive
  console.log('Adding files to archive:\n');
  await addDirectoryToArchive(archive, DIST_DIR, DIST_DIR);

  // Finalize archive
  await archive.finalize();
}

// Run packaging
packageExtension().catch((error) => {
  console.error('❌ Packaging failed:', error);
  process.exit(1);
});

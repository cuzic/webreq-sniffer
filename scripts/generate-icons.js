/**
 * Generate PNG icons from SVG source
 * Generates extension icons at required sizes: 16x16, 48x48, 128x128
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.resolve(__dirname, '../public/icons/icon-source.svg');
const outputDir = path.resolve(__dirname, '../public/icons');

const sizes = [
  { size: 16, name: 'icon16.png' },
  { size: 48, name: 'icon48.png' },
  { size: 128, name: 'icon128.png' },
];

async function generateIcons() {
  console.log('Generating extension icons...\n');

  if (!fs.existsSync(sourceFile)) {
    console.error(`Error: Source file not found: ${sourceFile}`);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read SVG source
  const svgBuffer = fs.readFileSync(sourceFile);

  // Generate icons at each size
  for (const { size, name } of sizes) {
    const outputPath = path.join(outputDir, name);

    try {
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size}) - ${stats.size} bytes`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch((error) => {
  console.error('Error generating icons:', error);
  process.exit(1);
});

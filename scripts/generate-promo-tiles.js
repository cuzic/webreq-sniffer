/**
 * Generate promotional tiles for Chrome Web Store
 * Creates small and large promotional tiles
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconSource = path.resolve(__dirname, '../public/icons/icon128.png');
const outputDir = path.resolve(__dirname, '../assets/promo');

// Chrome Web Store promotional tile sizes
const tiles = [
  { width: 440, height: 280, name: 'promo-small.png', description: 'Small promotional tile' },
  { width: 920, height: 680, name: 'promo-large.png', description: 'Large promotional tile' },
  {
    width: 1400,
    height: 560,
    name: 'promo-marquee.png',
    description: 'Marquee promotional tile',
  },
];

// Background gradient colors
const gradientColors = {
  start: { r: 37, g: 99, b: 235 }, // #2563eb (blue-600)
  end: { r: 59, g: 130, b: 246 }, // #3b82f6 (blue-500)
};

async function createGradientBackground(width, height) {
  // Create SVG with gradient background
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${gradientColors.start.r},${gradientColors.start.g},${gradientColors.start.b});stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(${gradientColors.end.r},${gradientColors.end.g},${gradientColors.end.b});stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
    </svg>
  `;

  return Buffer.from(svg);
}

async function createTextSVG(width, height, iconSize) {
  // Calculate font sizes based on tile size
  const titleSize = Math.floor(width / 12);
  const subtitleSize = Math.floor(width / 20);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Title -->
      <text x="50%" y="${height / 2 - iconSize / 2 - 40}"
            text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="${titleSize}px"
            font-weight="bold"
            fill="white">
        WebreqSniffer
      </text>

      <!-- Subtitle -->
      <text x="50%" y="${height / 2 + iconSize / 2 + 50}"
            text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="${subtitleSize}px"
            fill="rgba(255,255,255,0.9)">
        Monitor Network Requests
      </text>

      <text x="50%" y="${height / 2 + iconSize / 2 + 80}"
            text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="${subtitleSize}px"
            fill="rgba(255,255,255,0.9)">
        Generate Download Scripts
      </text>
    </svg>
  `;

  return Buffer.from(svg);
}

async function generatePromoTiles() {
  console.log('Generating promotional tiles for Chrome Web Store...\n');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Check if icon exists
  if (!fs.existsSync(iconSource)) {
    console.error(`Error: Icon not found: ${iconSource}`);
    console.error('Run "npm run icons" first.');
    process.exit(1);
  }

  // Read icon
  const iconBuffer = fs.readFileSync(iconSource);

  for (const tile of tiles) {
    const { width, height, name, description } = tile;
    const iconSize = Math.min(width, height) / 3;

    try {
      console.log(`Generating ${description} (${width}x${height})...`);

      // Create gradient background
      const gradientBg = await createGradientBackground(width, height);

      // Create text overlay
      const textOverlay = await createTextSVG(width, height, iconSize);

      // Resize icon (ensure integer size)
      const intIconSize = Math.floor(iconSize);
      const resizedIcon = await sharp(iconBuffer).resize(intIconSize, intIconSize).toBuffer();

      // Composite: background + icon + text
      const outputPath = path.join(outputDir, name);
      await sharp(gradientBg)
        .composite([
          {
            input: resizedIcon,
            top: Math.floor((height - intIconSize) / 2),
            left: Math.floor((width - intIconSize) / 2),
          },
          {
            input: textOverlay,
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`✓ Generated ${name} - ${stats.size} bytes\n`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
      process.exit(1);
    }
  }

  console.log('✓ All promotional tiles generated successfully!');
  console.log(`Tiles saved to: ${outputDir}`);
}

generatePromoTiles().catch((error) => {
  console.error('Error generating promotional tiles:', error);
  process.exit(1);
});

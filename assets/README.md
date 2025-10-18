# WebreqSniffer Assets

This directory contains all visual assets for the WebreqSniffer Chrome extension.

## Directory Structure

```
assets/
├── screenshots/         # Chrome Web Store screenshots
├── promo/              # Promotional tiles for Chrome Web Store
└── README.md           # This file
```

## Icons

Extension icons are located in `public/icons/`:

- `icon-source.svg` - Source SVG file (128x128)
- `icon16.png` - 16x16 toolbar icon
- `icon48.png` - 48x48 extension management icon
- `icon128.png` - 128x128 Chrome Web Store icon

### Generating Icons

Icons are automatically generated during the build process, but can be regenerated manually:

```bash
npm run icons
```

This runs `scripts/generate-icons.js` which converts the SVG source to PNG files at the required sizes.

## Screenshots

Screenshots are located in `assets/screenshots/`:

- `screenshot-popup.png` - Popup UI (800x600)
- `screenshot-options-filters.png` - Options page, Filters tab (1280x800)
- `screenshot-options-collection.png` - Options page, Collection Policy tab (1280x800)
- `screenshot-options-limits.png` - Options page, Limits & Export tab (1280x800)

### Generating Screenshots

Screenshots are captured from the running extension using Puppeteer:

```bash
npm run screenshots
```

This requires the extension to be built first (`npm run build`).

**Note:** Screenshots require a display server. In headless environments, use:

```bash
xvfb-run --auto-servernum npm run screenshots
```

## Promotional Tiles

Promotional tiles for Chrome Web Store are located in `assets/promo/`:

- `promo-small.png` - 440x280 (required)
- `promo-large.png` - 920x680 (optional)
- `promo-marquee.png` - 1400x560 (optional)

### Generating Promotional Tiles

```bash
npm run promo
```

This creates promotional tiles with a gradient background, the extension icon, and descriptive text.

## Generate All Assets

To regenerate all icons and promotional tiles:

```bash
npm run assets
```

To include screenshots:

```bash
npm run assets && npm run screenshots
```

## Chrome Web Store Requirements

### Icons

- ✅ 16x16 - Toolbar icon
- ✅ 48x48 - Extension management page
- ✅ 128x128 - Chrome Web Store and installation

### Screenshots

- ✅ At least 1 screenshot required
- ✅ Size: 640x400 to 1280x800 pixels
- ✅ Format: PNG or JPEG

### Promotional Tiles

- ✅ Small tile (440x280) - Required
- ✅ Large tile (920x680) - Optional but recommended
- ✅ Marquee (1400x560) - Optional

## Design Guidelines

### Color Scheme

- Primary: #2563eb (blue-600)
- Secondary: #3b82f6 (blue-500)
- Accent: #93c5fd (blue-300)

### Icon Design

The icon features:

- Network signal waves representing HTTP requests
- Magnifying glass symbolizing "sniffing" and monitoring
- Clean, modern design that scales well at all sizes

### Typography

- Font: Arial, sans-serif
- Title: Bold, large
- Subtitle: Regular, medium

## Updating Assets

When making changes to the visual design:

1. Edit the source file:
   - Icons: `public/icons/icon-source.svg`
   - Promo tiles: Modify `scripts/generate-promo-tiles.js`

2. Regenerate assets:

   ```bash
   npm run icons    # For icon changes
   npm run promo    # For promo tile changes
   ```

3. Rebuild the extension:

   ```bash
   npm run build
   ```

4. Regenerate screenshots if UI changed:
   ```bash
   npm run screenshots
   ```

## Tools Used

- **sharp** - High-performance image processing (SVG to PNG conversion, compositing)
- **Puppeteer** - Browser automation for screenshot capture

## License

All assets are part of the WebreqSniffer project and follow the same MIT license.

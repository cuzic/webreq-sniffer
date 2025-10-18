/**
 * Generate screenshots for Chrome Web Store
 * Captures screenshots of popup and options pages
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '../dist');
const screenshotsDir = path.resolve(__dirname, '../assets/screenshots');

async function generateScreenshots() {
  console.log('Generating Chrome Web Store screenshots...\n');

  // Ensure screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Check if dist exists
  if (!fs.existsSync(distPath)) {
    console.error('Error: Extension not built. Run "npm run build" first.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${distPath}`,
      `--load-extension=${distPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1280,800',
    ],
  });

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const targets = await browser.targets();
    const extensionTarget = targets.find(
      (target) => target.type() === 'service_worker' && target.url().includes('chrome-extension://')
    );

    if (!extensionTarget) {
      console.error('Error: Extension not loaded');
      await browser.close();
      process.exit(1);
    }

    const extensionId = extensionTarget.url().split('/')[2];
    console.log(`Extension ID: ${extensionId}\n`);

    // Screenshot 1: Popup Page
    console.log('Capturing popup screenshot...');
    const popupUrl = `chrome-extension://${extensionId}/src/popup/popup.html`;
    const popupPage = await browser.newPage();
    await popupPage.setViewport({ width: 800, height: 600 });
    await popupPage.goto(popupUrl, { waitUntil: 'networkidle0' });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const popupScreenshot = path.join(screenshotsDir, 'screenshot-popup.png');
    await popupPage.screenshot({
      path: popupScreenshot,
      fullPage: false,
    });
    console.log(`✓ Saved popup screenshot: ${popupScreenshot}`);
    await popupPage.close();

    // Screenshot 2: Options Page - Filters Tab
    console.log('Capturing options page (Filters) screenshot...');
    const optionsUrl = `chrome-extension://${extensionId}/src/options/options.html`;
    const optionsPage = await browser.newPage();
    await optionsPage.setViewport({ width: 1280, height: 800 });
    await optionsPage.goto(optionsUrl, { waitUntil: 'networkidle0' });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const optionsScreenshot = path.join(screenshotsDir, 'screenshot-options-filters.png');
    await optionsPage.screenshot({
      path: optionsScreenshot,
      fullPage: false,
    });
    console.log(`✓ Saved options screenshot: ${optionsScreenshot}`);

    // Screenshot 3: Options Page - Collection Policy Tab
    console.log('Capturing options page (Collection Policy) screenshot...');
    await optionsPage.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
      const collectionTab = tabs.find((tab) => tab.textContent?.includes('Collection Policy'));
      if (collectionTab) collectionTab.click();
    });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const optionsCollectionScreenshot = path.join(
      screenshotsDir,
      'screenshot-options-collection.png'
    );
    await optionsPage.screenshot({
      path: optionsCollectionScreenshot,
      fullPage: false,
    });
    console.log(`✓ Saved options (Collection Policy) screenshot: ${optionsCollectionScreenshot}`);

    // Screenshot 4: Options Page - Limits & Export Tab
    console.log('Capturing options page (Limits & Export) screenshot...');
    await optionsPage.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
      const limitsTab = tabs.find((tab) => tab.textContent?.includes('Limits & Export'));
      if (limitsTab) limitsTab.click();
    });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const optionsLimitsScreenshot = path.join(screenshotsDir, 'screenshot-options-limits.png');
    await optionsPage.screenshot({
      path: optionsLimitsScreenshot,
      fullPage: false,
    });
    console.log(`✓ Saved options (Limits & Export) screenshot: ${optionsLimitsScreenshot}`);

    await optionsPage.close();

    console.log('\n✓ All screenshots generated successfully!');
    console.log(`Screenshots saved to: ${screenshotsDir}`);
  } catch (error) {
    console.error('Error generating screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

generateScreenshots().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

/**
 * E2E Test Helpers
 * Utilities for Puppeteer-based E2E testing
 *
 * IMPORTANT: Chrome extensions require headful mode (headless: false).
 * In CI/CD or headless environments, use xvfb-run to provide a virtual display.
 *
 * Example:
 *   xvfb-run --auto-servernum npm run test:e2e
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../dist');

export interface ExtensionContext {
  browser: Browser;
  page: Page;
  extensionId?: string;
}

/**
 * Launch Chrome with the extension loaded
 */
export async function launchBrowserWithExtension(): Promise<ExtensionContext> {
  const browser = await puppeteer.launch({
    headless: false, // Extensions require headful mode (use xvfb-run in CI)
    args: [
      `--disable-extensions-except=${distPath}`,
      `--load-extension=${distPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();

  // Get extension ID - wait a bit for service worker to initialize
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const targets = await browser.targets();

  // Try to find extension by service worker first
  let extensionTarget = targets.find(
    (target) => target.type() === 'service_worker' && target.url().includes('chrome-extension://')
  );

  // If not found, try to find by background page or any chrome-extension URL
  if (!extensionTarget) {
    extensionTarget = targets.find((target) => target.url().includes('chrome-extension://'));
  }

  const extensionId = extensionTarget?.url().split('/')[2];

  return { browser, page, extensionId };
}

/**
 * Open extension popup
 */
export async function openPopup(browser: Browser, extensionId: string): Promise<Page> {
  const popupUrl = `chrome-extension://${extensionId}/src/popup/popup.html`;
  const page = await browser.newPage();
  await page.goto(popupUrl, { waitUntil: 'networkidle0' });
  return page;
}

/**
 * Open extension options page
 */
export async function openOptionsPage(browser: Browser, extensionId: string): Promise<Page> {
  const optionsUrl = `chrome-extension://${extensionId}/src/options/options.html`;
  const page = await browser.newPage();
  await page.goto(optionsUrl, { waitUntil: 'networkidle0' });
  return page;
}

/**
 * Wait for element with text
 */
export async function waitForText(page: Page, text: string, timeout = 5000): Promise<void> {
  await page.waitForFunction(
    (searchText) => {
      return document.body.textContent?.includes(searchText);
    },
    { timeout },
    text
  );
}

/**
 * Click button by text
 */
export async function clickButtonByText(page: Page, text: string): Promise<void> {
  await page.evaluate((buttonText) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const button = buttons.find((btn) => btn.textContent?.includes(buttonText));
    if (!button) throw new Error(`Button with text "${buttonText}" not found`);
    (button as HTMLButtonElement).click();
  }, text);
}

/**
 * Get text content of element
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  const element = await page.$(selector);
  if (!element) throw new Error(`Element ${selector} not found`);
  return await page.evaluate((el) => el.textContent || '', element);
}

/**
 * Wait for condition
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) return;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error('Timeout waiting for condition');
}

/**
 * Cleanup - close browser
 */
export async function cleanup(context: ExtensionContext): Promise<void> {
  if (context.browser) {
    await context.browser.close();
  }
}

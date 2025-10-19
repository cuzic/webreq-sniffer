/**
 * E2E Tests - Extension Loading
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  launchBrowserWithExtension,
  openPopup,
  openOptionsPage,
  cleanup,
  waitForText,
  clickButtonByText,
  ExtensionContext,
} from './helpers';

describe.sequential('Extension E2E Tests', () => {
  let context: ExtensionContext;

  beforeAll(async () => {
    context = await launchBrowserWithExtension();
  }, 30000);

  afterAll(async () => {
    await cleanup(context);
  });

  describe('Extension Loading', () => {
    it('should load the extension successfully', () => {
      expect(context.extensionId).toBeDefined();
      expect(context.extensionId).toMatch(/^[a-z]{32}$/);
    });

    it('should have service worker running', async () => {
      const targets = await context.browser.targets();
      const serviceWorker = targets.find((target) => target.type() === 'service_worker');
      expect(serviceWorker).toBeDefined();
    });
  });

  describe('Popup UI', () => {
    it('should open popup page', async () => {
      const popupPage = await openPopup(context.browser, context.extensionId!);
      await waitForText(popupPage, 'WebreqSniffer');

      const title = await popupPage.title();
      expect(title).toBe('WebreqSniffer');

      await popupPage.close();
    }, 10000);

    it('should display monitoring status', async () => {
      const popupPage = await openPopup(context.browser, context.extensionId!);
      await waitForText(popupPage, '停止中');

      const hasStatus = await popupPage.evaluate(() => {
        return document.body.textContent?.includes('停止中') || false;
      });
      expect(hasStatus).toBe(true);

      await popupPage.close();
    }, 10000);

    it('should have start monitoring button', async () => {
      const popupPage = await openPopup(context.browser, context.extensionId!);

      const hasStartButton = await popupPage.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some((btn) => btn.textContent?.includes('監視スタート'));
      });
      expect(hasStartButton).toBe(true);

      await popupPage.close();
    }, 10000);

    it('should show log count', async () => {
      const popupPage = await openPopup(context.browser, context.extensionId!);
      await waitForText(popupPage, 'ログ件数');

      const hasLogCount = await popupPage.evaluate(() => {
        return document.body.textContent?.includes('ログ件数') || false;
      });
      expect(hasLogCount).toBe(true);

      await popupPage.close();
    }, 10000);

    it('should have download and clear buttons', async () => {
      const popupPage = await openPopup(context.browser, context.extensionId!);

      const buttons = await popupPage.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map((btn) => btn.textContent || '');
      });

      expect(buttons.some((text) => text.includes('ログをダウンロード'))).toBe(true);
      expect(buttons.some((text) => text.includes('ログをクリア'))).toBe(true);

      await popupPage.close();
    }, 10000);
  });

  describe('Options Page', () => {
    it('should open options page', async () => {
      const optionsPage = await openOptionsPage(context.browser, context.extensionId!);
      await waitForText(optionsPage, 'WebreqSniffer Settings');

      const title = await optionsPage.title();
      expect(title).toBe('WebreqSniffer Options');

      await optionsPage.close();
    }, 10000);

    it('should display settings tabs', async () => {
      const optionsPage = await openOptionsPage(context.browser, context.extensionId!);
      await waitForText(optionsPage, 'Filters');

      const tabs = await optionsPage.evaluate(() => {
        return Array.from(document.querySelectorAll('[role="tab"]')).map(
          (tab) => tab.textContent || ''
        );
      });

      expect(tabs).toContain('Presets');
      expect(tabs).toContain('Filters');
      expect(tabs).toContain('Collection');
      expect(tabs).toContain('Limits');
      expect(tabs).toContain('Export');
      expect(tabs).toContain('Advanced');

      await optionsPage.close();
    }, 10000);

    it('should have save button', async () => {
      const optionsPage = await openOptionsPage(context.browser, context.extensionId!);

      const hasSaveButton = await optionsPage.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some((btn) => btn.textContent?.includes('Save Settings'));
      });
      expect(hasSaveButton).toBe(true);

      await optionsPage.close();
    }, 10000);

    it('should display preset buttons', async () => {
      const optionsPage = await openOptionsPage(context.browser, context.extensionId!);
      await waitForText(optionsPage, 'Presets');

      const hasPresets = await optionsPage.evaluate(() => {
        const text = document.body.textContent || '';
        return (
          text.includes('動画ストリーミング') &&
          text.includes('ドキュメント') &&
          text.includes('画像')
        );
      });
      expect(hasPresets).toBe(true);

      await optionsPage.close();
    }, 10000);
  });

  describe('Monitoring Functionality', () => {
    it('should start monitoring when button clicked', async () => {
      const popupPage = await openPopup(context.browser, context.extensionId!);
      await waitForText(popupPage, '監視スタート');

      // Click start button
      await clickButtonByText(popupPage, '監視スタート');

      // Wait for status change
      await waitForText(popupPage, '監視中', 3000);

      const isMonitoring = await popupPage.evaluate(() => {
        return document.body.textContent?.includes('監視中') || false;
      });
      expect(isMonitoring).toBe(true);

      await popupPage.close();
    }, 15000);

    it('should stop monitoring when stop button clicked', async () => {
      const popupPage = await openPopup(context.browser, context.extensionId!);

      // Check if already monitoring (from previous test), if not, start it
      const isAlreadyMonitoring = await popupPage.evaluate(() => {
        return document.body.textContent?.includes('監視中') || false;
      });

      if (!isAlreadyMonitoring) {
        await clickButtonByText(popupPage, '監視スタート');
        await waitForText(popupPage, '監視中', 3000);
      }

      // Stop monitoring
      await clickButtonByText(popupPage, '監視ストップ');
      await waitForText(popupPage, '停止中', 3000);

      const isStopped = await popupPage.evaluate(() => {
        return document.body.textContent?.includes('停止中') || false;
      });
      expect(isStopped).toBe(true);

      await popupPage.close();
    }, 15000);
  });
});

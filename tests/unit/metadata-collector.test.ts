/**
 * Unit Tests for Metadata Collector
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { collectPageMetadata } from '@/content/metadata-collector';
import type { CustomSelector } from '@/types';

// Setup and teardown for DOM manipulation
let originalDocument: Document;

beforeEach(() => {
  // Save original document
  originalDocument = global.document;
});

afterEach(() => {
  // Restore original document
  global.document = originalDocument;
});

describe('Metadata Collector', () => {
  describe('collectPageMetadata', () => {
    it('should collect basic page title', async () => {
      // Mock document
      const mockDocument = {
        title: 'Test Page Title',
        querySelector: () => null,
        querySelectorAll: () => [],
      } as unknown as Document;
      global.document = mockDocument;

      const metadata = await collectPageMetadata();
      expect(metadata.pageTitle).toBe('Test Page Title');
    });

    it('should extract OG title from meta tag', async () => {
      const ogTitleElement = {
        getAttribute: (attr: string) => (attr === 'content' ? 'OG Test Title' : null),
      };

      const mockDocument = {
        title: 'Test Page',
        querySelector: (selector: string) => {
          if (selector === 'meta[property="og:title"]') return ogTitleElement;
          return null;
        },
        querySelectorAll: () => [],
      } as unknown as Document;
      global.document = mockDocument;

      const metadata = await collectPageMetadata();
      expect(metadata.ogTitle).toBe('OG Test Title');
    });

    it('should extract meta description', async () => {
      const metaDescElement = {
        getAttribute: (attr: string) => (attr === 'content' ? 'Test description' : null),
      };

      const mockDocument = {
        title: 'Test Page',
        querySelector: (selector: string) => {
          if (selector === 'meta[name="description"]') return metaDescElement;
          return null;
        },
        querySelectorAll: () => [],
      } as unknown as Document;
      global.document = mockDocument;

      const metadata = await collectPageMetadata();
      expect(metadata.metaDescription).toBe('Test description');
    });

    it('should extract video title using custom selector with matching pattern', async () => {
      const videoTitleElement = {
        textContent: 'Custom Video Title  ',
        getAttribute: () => null,
      };

      const mockDocument = {
        title: 'Page Title',
        querySelector: (selector: string) => {
          if (selector === 'h1.video-title') return videoTitleElement;
          return null;
        },
        querySelectorAll: () => [],
      } as unknown as Document;
      global.document = mockDocument;

      // Mock window.location
      Object.defineProperty(global.window, 'location', {
        value: {
          href: 'https://example.com/watch?v=123',
          hostname: 'example.com',
        },
        writable: true,
      });

      const customSelectors: CustomSelector[] = [
        {
          id: 'custom-1',
          name: 'Example Site',
          pattern: 'example.com',
          selector: 'h1.video-title',
          enabled: true,
        },
      ];

      const metadata = await collectPageMetadata(customSelectors);
      expect(metadata.videoTitle).toBe('Custom Video Title');
    });

    it('should skip disabled custom selectors', async () => {
      const mockDocument = {
        title: 'Page Title',
        querySelector: () => null,
        querySelectorAll: () => [],
      } as unknown as Document;
      global.document = mockDocument;

      Object.defineProperty(global.window, 'location', {
        value: {
          href: 'https://example.com/watch',
          hostname: 'example.com',
        },
        writable: true,
      });

      const customSelectors: CustomSelector[] = [
        {
          id: 'custom-1',
          name: 'Example Site',
          pattern: 'example.com',
          selector: 'h1.video-title',
          enabled: false, // Disabled
        },
      ];

      const metadata = await collectPageMetadata(customSelectors);
      expect(metadata.videoTitle).toBeUndefined();
    });

    it('should extract attribute value when attribute is specified', async () => {
      const videoElement = {
        textContent: 'Text Content',
        getAttribute: (attr: string) => (attr === 'data-title' ? 'Attribute Title' : null),
      };

      const mockDocument = {
        title: 'Page Title',
        querySelector: (selector: string) => {
          if (selector === 'div.player') return videoElement;
          return null;
        },
        querySelectorAll: () => [],
      } as unknown as Document;
      global.document = mockDocument;

      Object.defineProperty(global.window, 'location', {
        value: {
          href: 'https://example.com/video',
          hostname: 'example.com',
        },
        writable: true,
      });

      const customSelectors: CustomSelector[] = [
        {
          id: 'custom-1',
          name: 'Example',
          pattern: 'example.com',
          selector: 'div.player',
          attribute: 'data-title',
          enabled: true,
        },
      ];

      const metadata = await collectPageMetadata(customSelectors);
      expect(metadata.videoTitle).toBe('Attribute Title');
    });

    it('should match wildcard patterns', async () => {
      const videoTitleElement = {
        textContent: 'Video Title',
        getAttribute: () => null,
      };

      const mockDocument = {
        title: 'Page Title',
        querySelector: (selector: string) => {
          if (selector === 'h1') return videoTitleElement;
          return null;
        },
        querySelectorAll: () => [],
      } as unknown as Document;
      global.document = mockDocument;

      Object.defineProperty(global.window, 'location', {
        value: {
          href: 'https://sub.example.com/watch',
          hostname: 'sub.example.com',
        },
        writable: true,
      });

      const customSelectors: CustomSelector[] = [
        {
          id: 'custom-1',
          name: 'Example',
          pattern: '*.example.com',
          selector: 'h1',
          enabled: true,
        },
      ];

      const metadata = await collectPageMetadata(customSelectors);
      expect(metadata.videoTitle).toBe('Video Title');
    });

    it('should try multiple selectors in order and use first match', async () => {
      const firstElement = {
        textContent: 'First Title',
        getAttribute: () => null,
      };

      const mockDocument = {
        title: 'Page Title',
        querySelector: (selector: string) => {
          if (selector === 'h1.first') return firstElement;
          return null;
        },
        querySelectorAll: () => [],
      } as unknown as Document;
      global.document = mockDocument;

      Object.defineProperty(global.window, 'location', {
        value: {
          href: 'https://example.com/video',
          hostname: 'example.com',
        },
        writable: true,
      });

      const customSelectors: CustomSelector[] = [
        {
          id: 'custom-1',
          name: 'First',
          pattern: 'example.com',
          selector: 'h1.first',
          enabled: true,
        },
        {
          id: 'custom-2',
          name: 'Second',
          pattern: 'example.com',
          selector: 'h1.second',
          enabled: true,
        },
      ];

      const metadata = await collectPageMetadata(customSelectors);
      expect(metadata.videoTitle).toBe('First Title');
    });

    it('should fallback to video element title attribute when no custom selector matches', async () => {
      const videoElement = {
        getAttribute: (attr: string) => (attr === 'title' ? 'Video Element Title' : null),
      };

      const mockDocument = {
        title: 'Page Title',
        querySelector: (selector: string) => {
          if (selector === 'video') return videoElement;
          return null;
        },
        querySelectorAll: () => [],
      } as unknown as Document;
      global.document = mockDocument;

      Object.defineProperty(global.window, 'location', {
        value: {
          href: 'https://unknown.com/video',
          hostname: 'unknown.com',
        },
        writable: true,
      });

      const customSelectors: CustomSelector[] = [
        {
          id: 'custom-1',
          name: 'Other Site',
          pattern: 'example.com',
          selector: 'h1',
          enabled: true,
        },
      ];

      const metadata = await collectPageMetadata(customSelectors);
      expect(metadata.videoTitle).toBe('Video Element Title');
    });
  });
});

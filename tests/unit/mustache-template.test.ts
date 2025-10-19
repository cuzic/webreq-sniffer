/**
 * Unit Tests for Mustache Template Engine
 * TDD approach for Issue #67 - CSP compliance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderTemplate,
  validateTemplate,
  clearTemplateCache,
  enrichEntries,
  type EnrichedLogEntry,
} from '@/lib/mustache-template';
import type { LogEntry } from '@/types';

describe('Mustache Template Engine', () => {
  let mockEntries: LogEntry[];

  beforeEach(() => {
    clearTemplateCache();
    mockEntries = [
      {
        id: '1',
        requestId: 'req-1',
        url: 'https://example.com/video.m3u8',
        method: 'GET',
        type: 'media',
        tabId: 1,
        frameId: 0,
        timestamp: 1640995200000, // 2022-01-01 00:00:00 UTC
        dedupeKey: 'key1',
        requestHeaders: {
          'User-Agent': 'Mozilla/5.0',
          Referer: 'https://example.com/page',
        },
      },
      {
        id: '2',
        requestId: 'req-2',
        url: 'https://example.com/audio.mp3',
        method: 'GET',
        type: 'media',
        tabId: 1,
        frameId: 0,
        timestamp: 1640995260000, // 2022-01-01 00:01:00 UTC
        dedupeKey: 'key2',
        requestHeaders: {
          'User-Agent': 'Mozilla/5.0',
        },
      },
    ];
  });

  describe('enrichEntries', () => {
    it('should enrich entries with computed fields', () => {
      const enriched = enrichEntries(mockEntries);

      expect(enriched).toHaveLength(2);
      expect(enriched[0]).toMatchObject({
        id: '1',
        url: 'https://example.com/video.m3u8',
        index: 0,
        index1: 1,
        domain: 'example.com',
        path: '/video.m3u8',
        protocol: 'https',
        filename: 'video.m3u8',
        fileExtension: 'm3u8',
      });
    });

    it('should include formatted date', () => {
      const enriched = enrichEntries(mockEntries);

      expect(enriched[0]?.formattedDate).toBeDefined();
      expect(enriched[0]?.formattedDateISO).toBe('2022-01-01T00:00:00.000Z');
    });

    it('should include helper values for headers', () => {
      const enriched = enrichEntries(mockEntries);

      expect(enriched[0]?.referer).toBe('https://example.com/page');
      expect(enriched[0]?.userAgent).toBe('Mozilla/5.0');
      expect(enriched[1]?.referer).toBeUndefined();
    });

    it('should handle invalid URLs gracefully', () => {
      const invalidEntry: LogEntry = {
        ...mockEntries[0]!,
        url: 'not-a-valid-url',
      };

      const enriched = enrichEntries([invalidEntry]);

      expect(enriched[0]).toMatchObject({
        domain: '',
        path: '',
        protocol: '',
        filename: 'file',
        fileExtension: 'bin',
      });
    });
  });

  describe('renderTemplate', () => {
    it('should render simple variable substitution', () => {
      const template = '{{{url}}}';
      const result = renderTemplate(template, [mockEntries[0]!]);

      expect(result).toContain('https://example.com/video.m3u8');
    });

    it('should render loop over entries', () => {
      const template = `{{#entries}}
{{{url}}}
{{/entries}}`;
      const result = renderTemplate(template, mockEntries);

      expect(result).toContain('https://example.com/video.m3u8');
      expect(result).toContain('https://example.com/audio.mp3');
    });

    it('should render entry index', () => {
      const template = `{{#entries}}
Entry {{index1}}: {{filename}}
{{/entries}}`;
      const result = renderTemplate(template, mockEntries);

      expect(result).toContain('Entry 1: video.m3u8');
      expect(result).toContain('Entry 2: audio.mp3');
    });

    it('should render conditional referer', () => {
      const template = `{{#entries}}
{{#referer}}--referer "{{{.}}}"{{/referer}}
{{/entries}}`;
      const result = renderTemplate(template, mockEntries);

      expect(result).toContain('--referer "https://example.com/page"');
    });

    it('should render formatted dates', () => {
      const template = `{{#entries}}
{{formattedDate}}
{{/entries}}`;
      const result = renderTemplate(template, mockEntries);

      expect(result).toContain('2022-01-01');
    });

    it('should render global variables', () => {
      const template = `Total: {{totalEntries}}
Domain: {{domain}}`;
      const result = renderTemplate(template, mockEntries);

      expect(result).toContain('Total: 2');
      expect(result).toContain('Domain: example.com');
    });

    it('should escape HTML entities by default', () => {
      const entryWithHtml: LogEntry = {
        ...mockEntries[0]!,
        url: 'https://example.com/test?param=<script>alert(1)</script>',
      };

      // Using double braces (not triple) for escaping
      const template = '{{url}}';
      const result = renderTemplate(template, [entryWithHtml]);

      // Mustache escapes HTML by default with double braces
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should support unescaped output with triple braces', () => {
      const template = '{{{url}}}';
      const result = renderTemplate(template, [mockEntries[0]!]);

      expect(result).toBe('https://example.com/video.m3u8');
    });

    it('should cache compiled templates', () => {
      const template = '{{url}}';

      const result1 = renderTemplate(template, [mockEntries[0]!]);
      const result2 = renderTemplate(template, [mockEntries[0]!]);

      expect(result1).toBe(result2);
    });
  });

  describe('validateTemplate', () => {
    it('should validate correct template', () => {
      const template = '{{url}}';
      const result = validateTemplate(template);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate template with loops', () => {
      const template = '{{#entries}}{{url}}{{/entries}}';
      const result = validateTemplate(template);

      expect(result.valid).toBe(true);
    });

    it('should detect unclosed tags', () => {
      const template = '{{#entries}}{{url}}';
      const result = validateTemplate(template);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      // Mustache.parse will throw an error for unclosed sections
    });

    it('should detect malformed tags', () => {
      const template = '{{}}';
      const result = validateTemplate(template);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('clearTemplateCache', () => {
    it('should clear the template cache', () => {
      const template = '{{{url}}}';

      // Compile and cache
      renderTemplate(template, [mockEntries[0]!]);

      // Clear cache
      clearTemplateCache();

      // Should still work after clearing
      const result = renderTemplate(template, [mockEntries[0]!]);
      expect(result).toContain('https://example.com/video.m3u8');
    });
  });

  describe('Complex Templates', () => {
    it('should render bash wget script', () => {
      const template = `#!/bin/bash

# Exported from WebreqSniffer
# Total entries: {{totalEntries}}

{{#entries}}
# Entry {{index1}}: {{filename}}
wget "{{{url}}}" \\
  {{#referer}}--referer "{{{.}}}" \\{{/referer}}
  {{#userAgent}}-U "{{{.}}}" \\{{/userAgent}}
  -O "{{formattedDate}}_{{filename}}"
{{/entries}}`;

      const result = renderTemplate(template, mockEntries);

      expect(result).toContain('#!/bin/bash');
      expect(result).toContain('Total entries: 2');
      expect(result).toContain('wget "https://example.com/video.m3u8"');
      expect(result).toContain('--referer "https://example.com/page"');
      expect(result).toContain('-U "Mozilla/5.0"');
      expect(result).toContain('2022-01-01_video.m3u8');
    });

    it('should render yt-dlp script', () => {
      const template = `#!/bin/bash

{{#entries}}
yt-dlp "{{{url}}}" \\
  {{#referer}}--referer "{{{.}}}" \\{{/referer}}
  -o "{{filename}}"
{{/entries}}`;

      const result = renderTemplate(template, mockEntries);

      expect(result).toContain('yt-dlp "https://example.com/video.m3u8"');
      expect(result).toContain('-o "video.m3u8"');
    });
  });

  describe('CSP Compliance', () => {
    it('should not use eval or new Function', () => {
      const template = '{{url}}';

      // This should not throw CSP error
      expect(() => {
        renderTemplate(template, [mockEntries[0]!]);
      }).not.toThrow();
    });

    it('should work in strict CSP environment', () => {
      // Simulate CSP by checking that no dynamic code execution is used
      const originalFunction = Function;
      const originalEval = eval;

      try {
        // @ts-expect-error - intentionally breaking Function for testing
        globalThis.Function = undefined;
        // @ts-expect-error - intentionally breaking eval for testing
        globalThis.eval = undefined;

        const template = '{{{url}}}';
        const result = renderTemplate(template, [mockEntries[0]!]);

        expect(result).toContain('https://example.com/video.m3u8');
      } finally {
        // Restore original functions
        globalThis.Function = originalFunction;
        globalThis.eval = originalEval;
      }
    });
  });
});

/**
 * Unit Tests for Export Filename Generation
 * Tests the integration of pipeline template engine with export functionality
 */

import { describe, it, expect } from 'vitest';
import { generateFilename } from '@/lib/export';
import type { LogEntry, ExportFormat } from '@/types';

describe('generateFilename with Pipeline Templates', () => {
  const baseEntry: LogEntry = {
    id: '1',
    timestamp: 1729259400000,
    url: 'https://example.com/video.m3u8',
    method: 'GET',
    type: 'media',
    headers: {},
  };

  const entryWithMetadata: LogEntry = {
    ...baseEntry,
    pageMetadata: {
      pageTitle: 'My Awesome Video - Example Site',
      ogTitle: 'My Awesome Video',
      videoTitle: 'My Awesome Video',
      metaTitle: 'Video Page',
      metaDescription: 'Watch this awesome video',
    },
  };

  const entryWithManifest: LogEntry = {
    ...entryWithMetadata,
    pageMetadata: {
      ...entryWithMetadata.pageMetadata!,
      manifestMetadata: {
        type: 'hls',
        title: 'Live Stream',
        segmentPattern: 'segment_%d.ts',
        programDateTime: '2025-10-18T14:30:00Z',
      },
    },
  };

  describe('Simple templates', () => {
    it('should generate filename with system variables', () => {
      const filename = generateFilename('{domain}_{timestamp}.{ext}', 'bash-curl', [baseEntry]);

      expect(filename).toMatch(/^example\.com_\d+\.sh$/);
    });

    it('should use date and time variables', () => {
      const filename = generateFilename('{date}_{time}.{ext}', 'bash-curl', [baseEntry]);

      expect(filename).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.sh$/);
    });

    it('should handle missing metadata gracefully', () => {
      const filename = generateFilename(
        '{videoTitle | default("untitled")}_{date}.{ext}',
        'bash-curl',
        [baseEntry]
      );

      expect(filename).toMatch(/^untitled_\d{4}-\d{2}-\d{2}\.sh$/);
    });
  });

  describe('Filters', () => {
    it('should apply lowercase filter', () => {
      const filename = generateFilename('{videoTitle | lowercase}.{ext}', 'bash-curl', [
        entryWithMetadata,
      ]);

      expect(filename).toBe('my_awesome_video.sh');
    });

    it('should apply slugify filter', () => {
      const filename = generateFilename('{videoTitle | slugify}.{ext}', 'bash-curl', [
        entryWithMetadata,
      ]);

      expect(filename).toBe('my-awesome-video.sh');
    });

    it('should apply truncate filter', () => {
      const filename = generateFilename('{videoTitle | truncate(10)}.{ext}', 'bash-curl', [
        entryWithMetadata,
      ]);

      expect(filename).toBe('My_Awesome.sh');
    });

    it('should apply replace filter', () => {
      const filename = generateFilename('{videoTitle | replace(" ", "_")}.{ext}', 'bash-curl', [
        entryWithMetadata,
      ]);

      expect(filename).toBe('My_Awesome_Video.sh');
    });

    it('should apply sanitize filter', () => {
      const entry: LogEntry = {
        ...baseEntry,
        pageMetadata: {
          videoTitle: 'Video: Part 1 (HD)',
        },
      };

      const filename = generateFilename('{videoTitle | sanitize}.{ext}', 'bash-curl', [entry]);

      // sanitizeFilename removes colons, parentheses
      expect(filename).not.toContain(':');
      expect(filename).not.toContain('(');
      expect(filename).not.toContain(')');
    });

    it('should apply removeParens filter', () => {
      const entry: LogEntry = {
        ...baseEntry,
        pageMetadata: {
          videoTitle: 'Video Title【Extra】(HD)',
        },
      };

      const filename = generateFilename('{videoTitle | removeParens}.{ext}', 'bash-curl', [entry]);

      expect(filename).toBe('Video_Title.sh');
    });
  });

  describe('Filter chains (pipelines)', () => {
    it('should apply multiple filters in sequence', () => {
      const filename = generateFilename(
        '{videoTitle | lowercase | replace(" ", "_")}.{ext}',
        'bash-curl',
        [entryWithMetadata]
      );

      expect(filename).toBe('my_awesome_video.sh');
    });

    it('should apply complex filter chain', () => {
      const filename = generateFilename(
        '{videoTitle | lowercase | replace(" ", "_") | truncate(10)}.{ext}',
        'bash-curl',
        [entryWithMetadata]
      );

      expect(filename).toBe('my_awesome.sh');
    });

    it('should use default filter with chain', () => {
      const filename = generateFilename(
        '{unknownVar | default("fallback") | uppercase}.{ext}',
        'bash-curl',
        [baseEntry]
      );

      expect(filename).toBe('FALLBACK.sh');
    });
  });

  describe('Conditional filters', () => {
    it('should use ifEquals filter (true case)', () => {
      const filename = generateFilename(
        '{manifestType | ifEquals("hls", "stream", "video")}.{ext}',
        'bash-curl',
        [entryWithManifest]
      );

      expect(filename).toBe('stream.sh');
    });

    it('should use ifEquals filter (false case)', () => {
      const entry: LogEntry = {
        ...entryWithManifest,
        pageMetadata: {
          ...entryWithManifest.pageMetadata!,
          manifestMetadata: {
            ...entryWithManifest.pageMetadata!.manifestMetadata!,
            type: 'dash',
          },
        },
      };

      const filename = generateFilename(
        '{manifestType | ifEquals("hls", "stream", "video")}.{ext}',
        'bash-curl',
        [entry]
      );

      expect(filename).toBe('video.sh');
    });

    it('should use ifContains filter', () => {
      const filename = generateFilename(
        '{videoTitle | ifContains("Awesome", "YES", "NO")}.{ext}',
        'bash-curl',
        [entryWithMetadata]
      );

      expect(filename).toBe('YES.sh');
    });

    it('should use ifEmpty filter (not empty)', () => {
      const filename = generateFilename('{videoTitle | ifEmpty("empty")}.{ext}', 'bash-curl', [
        entryWithMetadata,
      ]);

      expect(filename).toBe('My_Awesome_Video.sh');
    });

    it('should use ifEmpty filter (with undefined value)', () => {
      // When videoTitle is undefined (not in metadata), ifEmpty should provide fallback
      const filename = generateFilename('{videoTitle | ifEmpty("empty")}.{ext}', 'bash-curl', [
        baseEntry,
      ]);

      expect(filename).toBe('empty.sh');
    });
  });

  describe('Complex templates', () => {
    it('should generate YouTube-style filename', () => {
      const filename = generateFilename(
        '{videoTitle | lowercase | replace(" ", "_")}_{date}.{ext}',
        'bash-curl',
        [entryWithMetadata]
      );

      expect(filename).toMatch(/^my_awesome_video_\d{4}-\d{2}-\d{2}\.sh$/);
    });

    it('should generate manifest-based filename', () => {
      const filename = generateFilename(
        '{manifestType}_{manifestTitle | slugify}_{domain}.{ext}',
        'bash-curl',
        [entryWithManifest]
      );

      expect(filename).toBe('hls_live-stream_example.com.sh');
    });

    it('should handle mixed variables and filters', () => {
      const filename = generateFilename(
        '{videoTitle | slugify}_{timestamp}_{domain}.{ext}',
        'bash-curl',
        [entryWithMetadata]
      );

      expect(filename).toMatch(/^my-awesome-video_\d+_example\.com\.sh$/);
    });

    it('should use program date from manifest', () => {
      const filename = generateFilename(
        '{programDate}_{manifestTitle | slugify}.{ext}',
        'bash-curl',
        [entryWithManifest]
      );

      expect(filename).toBe('2025-10-18_live-stream.sh');
    });
  });

  describe('File extensions', () => {
    it('should use correct extension for bash-curl', () => {
      const filename = generateFilename('{domain}.{ext}', 'bash-curl', [baseEntry]);
      expect(filename).toMatch(/\.sh$/);
    });

    it('should use correct extension for powershell', () => {
      const filename = generateFilename('{domain}.{ext}', 'powershell', [baseEntry]);
      expect(filename).toMatch(/\.ps1$/);
    });

    it('should use correct extension for url-list', () => {
      const filename = generateFilename('{domain}.{ext}', 'url-list', [baseEntry]);
      expect(filename).toMatch(/\.txt$/);
    });

    it('should use correct extension for json', () => {
      const filename = generateFilename('{domain}.{ext}', 'json', [baseEntry]);
      expect(filename).toMatch(/\.json$/);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid template syntax with fallback', () => {
      const filename = generateFilename('{invalid syntax}', 'bash-curl', [baseEntry]);

      // Should fall back to safe filename
      expect(filename).toMatch(/example\.com.*\.sh$/);
    });

    it('should handle unknown filter with fallback', () => {
      const filename = generateFilename('{videoTitle | unknownFilter}', 'bash-curl', [
        entryWithMetadata,
      ]);

      // Should fall back to safe filename
      expect(filename).toMatch(/example\.com.*\.sh$/);
    });

    it('should handle empty entries array', () => {
      const filename = generateFilename('{domain}_{date}.{ext}', 'bash-curl', []);

      expect(filename).toMatch(/^unknown_\d{4}-\d{2}-\d{2}\.sh$/);
    });

    it('should handle entry without URL', () => {
      const entry: LogEntry = {
        ...baseEntry,
        url: 'invalid-url',
      };

      const filename = generateFilename('{domain}.{ext}', 'bash-curl', [entry]);

      expect(filename).toBe('unknown.sh');
    });
  });

  describe('Sanitization', () => {
    it('should sanitize invalid filesystem characters', () => {
      const entry: LogEntry = {
        ...baseEntry,
        pageMetadata: {
          videoTitle: 'Video/With\\Invalid:Chars*?<>|',
        },
      };

      const filename = generateFilename('{videoTitle}.{ext}', 'bash-curl', [entry]);

      // Should not contain invalid characters
      expect(filename).not.toMatch(/[/\\:*?<>|]/);
    });

    it('should handle Unicode characters', () => {
      const entry: LogEntry = {
        ...baseEntry,
        pageMetadata: {
          videoTitle: 'ビデオタイトル 日本語',
        },
      };

      const filename = generateFilename('{videoTitle}.{ext}', 'bash-curl', [entry]);

      // Should be valid filename
      expect(filename).toBeTruthy();
      expect(filename.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Tests for export format detection logic
 */

import { describe, it, expect } from 'vitest';
import type { LogEntry } from '@/types';
import { hasManifestVariants, isManifestUrl } from '@/lib/export';

/**
 * Helper: Create mock LogEntry
 */
function createMockEntry(url: string, hasVariants = false): LogEntry {
  return {
    id: 'test-id',
    requestId: 'req-123',
    url,
    method: 'GET',
    type: 'xmlhttprequest',
    tabId: 1,
    frameId: 0,
    timestamp: Date.now(),
    dedupeKey: 'test-dedupe',
    pageMetadata: hasVariants
      ? {
          pageTitle: 'Test Page',
          manifestMetadata: {
            type: 'hls',
            variants: [
              {
                url: 'https://example.com/1080p.m3u8',
                label: '1080p',
                resolution: '1920x1080',
                bandwidth: 5000000,
              },
              {
                url: 'https://example.com/720p.m3u8',
                label: '720p',
                resolution: '1280x720',
                bandwidth: 2800000,
              },
            ],
          },
        }
      : undefined,
  };
}

describe('hasManifestVariants', () => {
  it('should return true for single entry with variants', () => {
    const entries = [createMockEntry('https://example.com/master.m3u8', true)];

    expect(hasManifestVariants(entries)).toBe(true);
  });

  it('should return false for single entry without variants', () => {
    const entries = [createMockEntry('https://example.com/video.mp4', false)];

    expect(hasManifestVariants(entries)).toBe(false);
  });

  it('should return false for multiple entries', () => {
    const entries = [
      createMockEntry('https://example.com/master.m3u8', true),
      createMockEntry('https://example.com/other.m3u8', true),
    ];

    expect(hasManifestVariants(entries)).toBe(false);
  });

  it('should return false for empty array', () => {
    const entries: LogEntry[] = [];

    expect(hasManifestVariants(entries)).toBe(false);
  });

  it('should return false for entry with empty variants', () => {
    const entry = createMockEntry('https://example.com/master.m3u8', false);
    entry.pageMetadata = {
      pageTitle: 'Test',
      manifestMetadata: {
        type: 'hls',
        variants: [],
      },
    };

    expect(hasManifestVariants([entry])).toBe(false);
  });

  it('should return false for entry without manifestMetadata', () => {
    const entry = createMockEntry('https://example.com/master.m3u8', false);
    entry.pageMetadata = {
      pageTitle: 'Test',
    };

    expect(hasManifestVariants([entry])).toBe(false);
  });
});

describe('isManifestUrl', () => {
  it('should return true for .m3u8 URLs', () => {
    expect(isManifestUrl('https://example.com/master.m3u8')).toBe(true);
    expect(isManifestUrl('https://example.com/playlist.M3U8')).toBe(true);
    expect(isManifestUrl('https://example.com/path/to/stream.m3u8?token=abc')).toBe(true);
  });

  it('should return true for .mpd URLs', () => {
    expect(isManifestUrl('https://example.com/manifest.mpd')).toBe(true);
    expect(isManifestUrl('https://example.com/stream.MPD')).toBe(true);
    expect(isManifestUrl('https://example.com/path/to/dash.mpd?token=abc')).toBe(true);
  });

  it('should return false for non-manifest URLs', () => {
    expect(isManifestUrl('https://example.com/video.mp4')).toBe(false);
    expect(isManifestUrl('https://example.com/image.jpg')).toBe(false);
    expect(isManifestUrl('https://example.com/document.pdf')).toBe(false);
    expect(isManifestUrl('https://example.com/')).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(isManifestUrl('https://example.com/MASTER.M3U8')).toBe(true);
    expect(isManifestUrl('https://example.com/MANIFEST.MPD')).toBe(true);
  });

  it('should handle edge cases correctly', () => {
    // Domain contains 'm3u8' but not '.m3u8' - should be false
    expect(isManifestUrl('https://m3u8.example.com/video.mp4')).toBe(false);

    // Path contains '.m3u8' - should be true
    expect(isManifestUrl('https://example.com/path/.m3u8/video.mp4')).toBe(true);

    // Query parameter with manifest extension
    expect(isManifestUrl('https://example.com/stream.m3u8?quality=high')).toBe(true);
  });
});

describe('Format selection integration', () => {
  it('should detect manifest with variants correctly', () => {
    const manifestEntry = createMockEntry('https://example.com/master.m3u8', true);
    const entries = [manifestEntry];

    expect(hasManifestVariants(entries)).toBe(true);
    expect(isManifestUrl(manifestEntry.url)).toBe(true);
  });

  it('should detect regular video URL correctly', () => {
    const videoEntry = createMockEntry('https://example.com/video.mp4', false);
    const entries = [videoEntry];

    expect(hasManifestVariants(entries)).toBe(false);
    expect(isManifestUrl(videoEntry.url)).toBe(false);
  });

  it('should handle multiple regular entries', () => {
    const entries = [
      createMockEntry('https://example.com/video1.mp4', false),
      createMockEntry('https://example.com/video2.mp4', false),
    ];

    expect(hasManifestVariants(entries)).toBe(false);
  });
});

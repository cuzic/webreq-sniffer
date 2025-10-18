/**
 * Unit tests for batch download generator
 */

import { describe, it, expect } from 'vitest';
import type { LogEntry, StreamVariant } from '@/types';
import {
  generateBashBatchDownload,
  generatePowerShellBatchDownload,
} from '@/lib/batch-download-generator';

/**
 * Helper: Create mock LogEntry with variants
 */
function createMockEntry(variants?: StreamVariant[]): LogEntry {
  return {
    id: 'test-id',
    requestId: 'req-123',
    url: 'https://example.com/master.m3u8',
    method: 'GET',
    type: 'xmlhttprequest',
    tabId: 1,
    frameId: 0,
    timestamp: Date.now(),
    dedupeKey: 'test-dedupe',
    pageMetadata: {
      pageTitle: 'Test Video',
      manifestMetadata: variants
        ? {
            type: 'hls',
            variants,
          }
        : undefined,
    },
  };
}

describe('generateBashBatchDownload', () => {
  it('generates script with stream variants', () => {
    const entry = createMockEntry([
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
      {
        url: 'https://example.com/480p.m3u8',
        label: '480p',
        resolution: '854x480',
        bandwidth: 1400000,
      },
    ]);

    const script = generateBashBatchDownload(entry);

    // Check header
    expect(script).toContain('#!/bin/bash');
    expect(script).toContain('Batch Video Downloader');
    expect(script).toContain('https://example.com/master.m3u8');

    // Check stream declarations
    expect(script).toContain('declare -A STREAMS');
    expect(script).toContain(
      'STREAMS[1]="https://example.com/1080p.m3u8|1080p|1920x1080|5.0 Mbps"'
    );
    expect(script).toContain('STREAMS[2]="https://example.com/720p.m3u8|720p|1280x720|2.8 Mbps"');
    expect(script).toContain('STREAMS[3]="https://example.com/480p.m3u8|480p|854x480|1.4 Mbps"');

    // Check menu
    expect(script).toContain('Available video qualities:');
    expect(script).toContain('echo "1) 1080p');
    expect(script).toContain('echo "2) 720p');
    expect(script).toContain('echo "3) 480p');

    // Check download logic
    expect(script).toContain('read -p "Select qualities');
    expect(script).toContain('for idx in "${SELECTED[@]}"');
    expect(script).toContain('yt-dlp');
    expect(script).toContain('ffmpeg');
  });

  it('falls back to simple download when no variants', () => {
    const entry = createMockEntry();
    const script = generateBashBatchDownload(entry);

    expect(script).toContain('#!/bin/bash');
    expect(script).toContain('Simple Video Downloader');
    expect(script).not.toContain('declare -A STREAMS');
    expect(script).not.toContain('Select qualities');
    expect(script).toContain('https://example.com/master.m3u8');
  });

  it('handles special characters in URLs', () => {
    const entry = createMockEntry([
      {
        url: 'https://example.com/video$test.m3u8',
        label: '720p',
        resolution: '1280x720',
        bandwidth: 2800000,
      },
    ]);

    const script = generateBashBatchDownload(entry);

    // Should escape $ in URLs
    expect(script).toContain('https://example.com/video\\$test.m3u8');
  });

  it('sanitizes filename from page title', () => {
    const entry = createMockEntry([
      {
        url: 'https://example.com/720p.m3u8',
        label: '720p',
        resolution: '1280x720',
        bandwidth: 2800000,
      },
    ]);

    // Override page title with special characters
    entry.pageMetadata!.pageTitle = 'Test / Video: "Special" <Chars>';

    const script = generateBashBatchDownload(entry);

    // Should sanitize filename
    expect(script).toContain('BASE_NAME="Test___Video___Special___Chars_"');
  });

  it('handles variants without labels', () => {
    const entry = createMockEntry([
      {
        url: 'https://example.com/high.m3u8',
        resolution: '1920x1080',
        bandwidth: 5000000,
        // No label
      },
    ]);

    const script = generateBashBatchDownload(entry);

    // Should use resolution as fallback
    expect(script).toContain('1920x1080');
  });
});

describe('generatePowerShellBatchDownload', () => {
  it('generates script with stream variants', () => {
    const entry = createMockEntry([
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
    ]);

    const script = generatePowerShellBatchDownload(entry);

    // Check header
    expect(script).toContain('# Batch Video Downloader');
    expect(script).toContain('https://example.com/master.m3u8');

    // Check stream declarations
    expect(script).toContain('$Streams = @{}');
    expect(script).toContain(
      '$Streams["1"] = "https://example.com/1080p.m3u8|1080p|1920x1080|5.0 Mbps"'
    );
    expect(script).toContain(
      '$Streams["2"] = "https://example.com/720p.m3u8|720p|1280x720|2.8 Mbps"'
    );

    // Check menu
    expect(script).toContain('Available video qualities:');
    expect(script).toContain('Write-Host "1) 1080p');
    expect(script).toContain('Write-Host "2) 720p');

    // Check download logic
    expect(script).toContain('Read-Host "Select qualities');
    expect(script).toContain('foreach ($idx in $selected)');
    expect(script).toContain('yt-dlp');
    expect(script).toContain('ffmpeg');
    expect(script).toContain('-ForegroundColor');
  });

  it('falls back to simple download when no variants', () => {
    const entry = createMockEntry();
    const script = generatePowerShellBatchDownload(entry);

    expect(script).toContain('# Simple Video Downloader');
    expect(script).not.toContain('$Streams = @{}');
    expect(script).not.toContain('Select qualities');
    expect(script).toContain('https://example.com/master.m3u8');
  });

  it('handles special characters in URLs', () => {
    const entry = createMockEntry([
      {
        url: 'https://example.com/video"test.m3u8',
        label: '720p',
        resolution: '1280x720',
        bandwidth: 2800000,
      },
    ]);

    const script = generatePowerShellBatchDownload(entry);

    // Should escape " in URLs
    expect(script).toContain('https://example.com/video`"test.m3u8');
  });
});

describe('bandwidth formatting', () => {
  it('formats bandwidth in Mbps for high values', () => {
    const entry = createMockEntry([
      {
        url: 'https://example.com/1080p.m3u8',
        label: '1080p',
        resolution: '1920x1080',
        bandwidth: 5000000, // 5 Mbps
      },
    ]);

    const script = generateBashBatchDownload(entry);

    expect(script).toContain('5.0 Mbps');
  });

  it('formats bandwidth in kbps for low values', () => {
    const entry = createMockEntry([
      {
        url: 'https://example.com/low.m3u8',
        label: 'low',
        resolution: '426x240',
        bandwidth: 500000, // 500 kbps
      },
    ]);

    const script = generateBashBatchDownload(entry);

    expect(script).toContain('500 kbps');
  });

  it('handles missing bandwidth', () => {
    const entry = createMockEntry([
      {
        url: 'https://example.com/unknown.m3u8',
        label: 'unknown',
        resolution: '1280x720',
        // No bandwidth
      },
    ]);

    const script = generateBashBatchDownload(entry);

    expect(script).toContain('N/A');
  });
});

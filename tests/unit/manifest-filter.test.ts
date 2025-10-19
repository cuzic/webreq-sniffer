/**
 * Manifest Filter Tests
 * TDD for smart filtering of master vs media playlists
 */

import { describe, it, expect } from 'vitest';
import type { LogEntry } from '@/types';
import { filterManifestEntries } from '@/lib/manifest-filter';

describe('Manifest Filter', () => {
  const createEntry = (id: string, url: string, type: string = 'xmlhttprequest'): LogEntry => ({
    id,
    url,
    method: 'GET',
    type: type as any,
    timestamp: Date.now(),
    tabId: 1,
    headers: {},
  });

  describe('filterManifestEntries', () => {
    it('should keep master playlist and remove media playlists from same base URL', () => {
      const entries = [
        createEntry('1', 'https://example.com/video/master.m3u8'),
        createEntry('2', 'https://example.com/video/720p.m3u8'),
        createEntry('3', 'https://example.com/video/1080p.m3u8'),
      ];

      // Assuming master.m3u8 contains #EXT-X-STREAM-INF
      // and 720p/1080p contain #EXTINF (segments)
      const result = filterManifestEntries(entries);

      // Should keep only master
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('1');
    });

    it('should keep media playlist when no master exists', () => {
      const entries = [
        createEntry('1', 'https://example.com/video/playlist.m3u8'),
        createEntry('2', 'https://example.com/other/stream.m3u8'),
      ];

      // Both are media playlists (no master)
      const result = filterManifestEntries(entries);

      // Should keep all media playlists
      expect(result).toHaveLength(2);
    });

    it('should handle multiple groups independently', () => {
      const entries = [
        // Group 1: has master
        createEntry('1', 'https://example.com/video1/master.m3u8'),
        createEntry('2', 'https://example.com/video1/720p.m3u8'),
        // Group 2: no master
        createEntry('3', 'https://example.com/video2/playlist.m3u8'),
        // Group 3: different domain with master
        createEntry('4', 'https://cdn.example.com/master.m3u8'),
        createEntry('5', 'https://cdn.example.com/1080p.m3u8'),
      ];

      const result = filterManifestEntries(entries);

      // Should have: video1 master, video2 media, cdn master
      expect(result).toHaveLength(3);
      expect(result.map((e) => e.id).sort()).toEqual(['1', '3', '4']);
    });

    it('should keep all masters when multiple masters exist in same group', () => {
      const entries = [
        createEntry('1', 'https://example.com/video/master.m3u8'),
        createEntry('2', 'https://example.com/video/master-alt.m3u8'),
        createEntry('3', 'https://example.com/video/720p.m3u8'),
      ];

      const result = filterManifestEntries(entries);

      // Should keep both masters, remove media
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.id).sort()).toEqual(['1', '2']);
    });

    it('should handle DASH manifests similarly', () => {
      const entries = [
        createEntry('1', 'https://example.com/video/manifest.mpd'),
        createEntry('2', 'https://example.com/video/segment.m4s'),
      ];

      // manifest.mpd is master (has Representation)
      // segment.m4s is not a playlist
      const result = filterManifestEntries(entries);

      // Should keep MPD and segment (segment is not filtered)
      expect(result).toHaveLength(2);
    });

    it('should preserve non-manifest entries', () => {
      const entries = [
        createEntry('1', 'https://example.com/video/master.m3u8'),
        createEntry('2', 'https://example.com/video/720p.m3u8'),
        createEntry('3', 'https://example.com/api/data.json', 'xmlhttprequest'),
        createEntry('4', 'https://example.com/image.png', 'image'),
      ];

      const result = filterManifestEntries(entries);

      // Should keep master + non-manifests
      expect(result).toHaveLength(3);
      expect(result.map((e) => e.id).sort()).toEqual(['1', '3', '4']);
    });

    it('should handle empty array', () => {
      const result = filterManifestEntries([]);
      expect(result).toHaveLength(0);
    });

    it('should handle entries with no manifests', () => {
      const entries = [
        createEntry('1', 'https://example.com/video.mp4', 'media'),
        createEntry('2', 'https://example.com/image.jpg', 'image'),
      ];

      const result = filterManifestEntries(entries);
      expect(result).toHaveLength(2);
    });

    it('should group by base URL correctly', () => {
      const entries = [
        // Same base path, different files
        createEntry('1', 'https://example.com/videos/stream1/master.m3u8'),
        createEntry('2', 'https://example.com/videos/stream1/720p.m3u8'),
        // Different base path
        createEntry('3', 'https://example.com/videos/stream2/master.m3u8'),
        createEntry('4', 'https://example.com/videos/stream2/360p.m3u8'),
      ];

      const result = filterManifestEntries(entries);

      // Each group keeps its master
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.id).sort()).toEqual(['1', '3']);
    });

    it('should handle mixed HLS and DASH in same group', () => {
      const entries = [
        createEntry('1', 'https://example.com/video/master.m3u8'),
        createEntry('2', 'https://example.com/video/manifest.mpd'),
        createEntry('3', 'https://example.com/video/720p.m3u8'),
      ];

      const result = filterManifestEntries(entries);

      // Should keep both masters (HLS and DASH)
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.id).sort()).toEqual(['1', '2']);
    });
  });
});

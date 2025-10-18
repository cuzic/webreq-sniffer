/**
 * Unit Tests for Filtering Logic
 */

import { describe, it, expect } from 'vitest';
import {
  matchesDenyList,
  matchesAllowList,
  matchesResourceType,
  isMediaSegment,
  isPlaylistOrManifest,
  matchesSimpleFilters,
  matchesRegexFilters,
  shouldLogRequest,
} from '@/background/filtering';
import type { Settings } from '@/types';
import { defaultSettings } from '@/types/schemas';

describe('Filtering Logic', () => {
  describe('matchesDenyList', () => {
    it('should return true if URL matches deny pattern', () => {
      const denyList = ['analytics.google.com', 'ads.*'];
      expect(matchesDenyList('https://analytics.google.com/track', denyList)).toBe(true);
      expect(matchesDenyList('https://ads.example.com/banner.jpg', denyList)).toBe(true);
    });

    it('should return false if URL does not match deny pattern', () => {
      const denyList = ['analytics.google.com', 'ads.*'];
      expect(matchesDenyList('https://example.com/video.m3u8', denyList)).toBe(false);
    });

    it('should handle wildcard patterns', () => {
      const denyList = ['*.tracker.com'];
      expect(matchesDenyList('https://sub.tracker.com/ping', denyList)).toBe(true);
    });

    it('should return false for empty deny list', () => {
      expect(matchesDenyList('https://example.com/test', [])).toBe(false);
    });
  });

  describe('matchesAllowList', () => {
    it('should return true if allow list is empty', () => {
      expect(matchesAllowList('https://example.com/test', [])).toBe(true);
    });

    it('should return true if URL matches allow pattern', () => {
      const allowList = ['cdn.example.com', '*.video-cdn.net'];
      expect(matchesAllowList('https://cdn.example.com/video.m3u8', allowList)).toBe(true);
      expect(matchesAllowList('https://sub.video-cdn.net/segment.ts', allowList)).toBe(true);
    });

    it('should return false if URL does not match allow pattern', () => {
      const allowList = ['cdn.example.com'];
      expect(matchesAllowList('https://other.com/video.m3u8', allowList)).toBe(false);
    });
  });

  describe('matchesResourceType', () => {
    it('should return true if resource type is in list', () => {
      const resourceTypes = ['media', 'xmlhttprequest'];
      expect(matchesResourceType('media', resourceTypes)).toBe(true);
      expect(matchesResourceType('xmlhttprequest', resourceTypes)).toBe(true);
    });

    it('should return false if resource type is not in list', () => {
      const resourceTypes = ['media', 'xmlhttprequest'];
      expect(matchesResourceType('image', resourceTypes)).toBe(false);
    });

    it('should return true if resource types list is empty', () => {
      expect(matchesResourceType('anything', [])).toBe(true);
    });
  });

  describe('isMediaSegment', () => {
    it('should identify HLS segments', () => {
      expect(isMediaSegment('https://example.com/segment001.ts')).toBe(true);
      expect(isMediaSegment('https://example.com/chunk-12345.ts')).toBe(true);
    });

    it('should identify DASH segments', () => {
      expect(isMediaSegment('https://example.com/segment.m4s')).toBe(true);
      expect(isMediaSegment('https://example.com/video-1234.m4s')).toBe(true);
    });

    it('should not identify playlists as segments', () => {
      expect(isMediaSegment('https://example.com/playlist.m3u8')).toBe(false);
      expect(isMediaSegment('https://example.com/manifest.mpd')).toBe(false);
    });
  });

  describe('isPlaylistOrManifest', () => {
    it('should identify HLS playlists', () => {
      expect(isPlaylistOrManifest('https://example.com/video.m3u8')).toBe(true);
      expect(isPlaylistOrManifest('https://example.com/master.m3u8')).toBe(true);
      expect(isPlaylistOrManifest('https://example.com/index.m3u8')).toBe(true);
    });

    it('should identify DASH manifests', () => {
      expect(isPlaylistOrManifest('https://example.com/video.mpd')).toBe(true);
      expect(isPlaylistOrManifest('https://example.com/manifest.mpd')).toBe(true);
    });

    it('should not identify segments as playlists', () => {
      expect(isPlaylistOrManifest('https://example.com/segment.ts')).toBe(false);
      expect(isPlaylistOrManifest('https://example.com/video.m4s')).toBe(false);
    });
  });

  describe('matchesSimpleFilters', () => {
    it('should match URLs containing filter patterns', () => {
      const filters = ['.m3u8', '.mpd', '/api/'];
      expect(matchesSimpleFilters('https://example.com/video.m3u8', filters)).toBe(true);
      expect(matchesSimpleFilters('https://example.com/manifest.mpd', filters)).toBe(true);
      expect(matchesSimpleFilters('https://example.com/api/data', filters)).toBe(true);
    });

    it('should not match URLs without filter patterns', () => {
      const filters = ['.m3u8', '.mpd'];
      expect(matchesSimpleFilters('https://example.com/image.jpg', filters)).toBe(false);
    });

    it('should return false for empty filters', () => {
      expect(matchesSimpleFilters('https://example.com/test', [])).toBe(false);
    });
  });

  describe('matchesRegexFilters', () => {
    it('should match URLs with regex patterns', () => {
      const filters = ['.*\\.m3u8.*', '/video/\\d+'];
      expect(matchesRegexFilters('https://example.com/playlist.m3u8?token=xyz', filters)).toBe(
        true
      );
      expect(matchesRegexFilters('https://example.com/video/12345', filters)).toBe(true);
    });

    it('should not match URLs without regex patterns', () => {
      const filters = ['.*\\.m3u8.*'];
      expect(matchesRegexFilters('https://example.com/image.jpg', filters)).toBe(false);
    });

    it('should return false for empty regex filters', () => {
      expect(matchesRegexFilters('https://example.com/test', [])).toBe(false);
    });

    it('should handle invalid regex gracefully', () => {
      const filters = ['[invalid'];
      expect(matchesRegexFilters('https://example.com/test', filters)).toBe(false);
    });
  });

  describe('shouldLogRequest', () => {
    const baseSettings: Settings = {
      ...defaultSettings,
      simpleFilters: [],
      regexFilters: [],
      resourceTypes: [],
      allowList: [],
      denyList: [],
    };

    it('should deny requests matching deny list', () => {
      const settings: Settings = {
        ...baseSettings,
        denyList: ['analytics.google.com'],
      };
      expect(shouldLogRequest('https://analytics.google.com/track', 'script', settings)).toBe(
        false
      );
    });

    it('should deny requests not matching allow list', () => {
      const settings: Settings = {
        ...baseSettings,
        allowList: ['cdn.example.com'],
      };
      expect(shouldLogRequest('https://other.com/video.m3u8', 'media', settings)).toBe(false);
      expect(shouldLogRequest('https://cdn.example.com/video.m3u8', 'media', settings)).toBe(true);
    });

    it('should filter by resource type', () => {
      const settings: Settings = {
        ...baseSettings,
        resourceTypes: ['media', 'xmlhttprequest'],
      };
      expect(shouldLogRequest('https://example.com/video.m3u8', 'media', settings)).toBe(true);
      expect(shouldLogRequest('https://example.com/image.jpg', 'image', settings)).toBe(false);
    });

    it('should handle HLS/MPD playlistOnly mode', () => {
      const settings: Settings = {
        ...baseSettings,
        hlsMpdMode: 'playlistOnly',
      };
      expect(shouldLogRequest('https://example.com/playlist.m3u8', 'media', settings)).toBe(true);
      expect(shouldLogRequest('https://example.com/segment.ts', 'media', settings)).toBe(false);
      expect(shouldLogRequest('https://example.com/segment.m4s', 'media', settings)).toBe(false);
    });

    it('should allow all segments in HLS/MPD all mode', () => {
      const settings: Settings = {
        ...baseSettings,
        hlsMpdMode: 'all',
      };
      expect(shouldLogRequest('https://example.com/segment.ts', 'media', settings)).toBe(true);
      expect(shouldLogRequest('https://example.com/segment.m4s', 'media', settings)).toBe(true);
    });

    it('should match simple filters', () => {
      const settings: Settings = {
        ...baseSettings,
        simpleFilters: ['.m3u8', '.mpd'],
      };
      expect(shouldLogRequest('https://example.com/video.m3u8', 'media', settings)).toBe(true);
      expect(shouldLogRequest('https://example.com/video.mp4', 'media', settings)).toBe(false);
    });

    it('should match regex filters', () => {
      const settings: Settings = {
        ...baseSettings,
        regexFilters: ['.*\\.m3u8.*'],
      };
      expect(shouldLogRequest('https://example.com/video.m3u8?token=xyz', 'media', settings)).toBe(
        true
      );
    });

    it('should allow all if no filters are defined', () => {
      const settings: Settings = {
        ...baseSettings,
        simpleFilters: [],
        regexFilters: [],
      };
      expect(shouldLogRequest('https://example.com/anything', 'media', settings)).toBe(true);
    });
  });
});

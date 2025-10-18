/**
 * Unit Tests for RequestFilter
 * TDD approach for request filtering responsibility
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RequestFilter } from '@/background/request-filter';
import { defaultSettings } from '@/types';
import type { Settings } from '@/types';

describe('RequestFilter', () => {
  let filter: RequestFilter;
  let settings: Settings;

  beforeEach(() => {
    settings = { ...defaultSettings };
  });

  describe('shouldLog', () => {
    it('should reject URLs in deny list', () => {
      settings.denyList = ['*.google.com', '*.facebook.com'];
      filter = new RequestFilter(settings);

      const result = filter.shouldLog('https://www.google.com/search', 'main_frame');

      expect(result).toBe(false);
    });

    it('should allow URLs in allow list', () => {
      settings.allowList = ['*.example.com'];
      filter = new RequestFilter(settings);

      const result = filter.shouldLog('https://api.example.com/data', 'xmlhttprequest');

      expect(result).toBe(true);
    });

    it('should reject URLs not in allow list when allow list is set', () => {
      settings.allowList = ['*.example.com'];
      filter = new RequestFilter(settings);

      const result = filter.shouldLog('https://other.com/data', 'xmlhttprequest');

      expect(result).toBe(false);
    });

    it('should filter by resource type', () => {
      settings.resourceTypes = ['xmlhttprequest', 'media'];
      filter = new RequestFilter(settings);

      const xmlResult = filter.shouldLog('https://example.com/api', 'xmlhttprequest');
      const imageResult = filter.shouldLog('https://example.com/image.png', 'image');

      expect(xmlResult).toBe(true);
      expect(imageResult).toBe(false);
    });

    it('should exclude media segments in playlistOnly mode', () => {
      settings.hlsMpdMode = 'playlistOnly';
      filter = new RequestFilter(settings);

      const segmentResult = filter.shouldLog('https://example.com/video/segment123.ts', 'media');
      const playlistResult = filter.shouldLog('https://example.com/video/playlist.m3u8', 'media');

      expect(segmentResult).toBe(false);
      expect(playlistResult).toBe(true);
    });

    it('should include all media files when hlsMpdMode is all', () => {
      settings.hlsMpdMode = 'all';
      filter = new RequestFilter(settings);

      const segmentResult = filter.shouldLog('https://example.com/video/segment123.ts', 'media');
      const playlistResult = filter.shouldLog('https://example.com/video/playlist.m3u8', 'media');

      expect(segmentResult).toBe(true);
      expect(playlistResult).toBe(true);
    });

    it('should match simple filters', () => {
      settings.simpleFilters = ['/api/', '.mp4'];
      filter = new RequestFilter(settings);

      const apiResult = filter.shouldLog('https://example.com/api/data', 'xmlhttprequest');
      const videoResult = filter.shouldLog('https://example.com/video.mp4', 'media');
      const otherResult = filter.shouldLog('https://example.com/page.html', 'main_frame');

      expect(apiResult).toBe(true);
      expect(videoResult).toBe(true);
      expect(otherResult).toBe(false);
    });

    it('should match regex filters', () => {
      settings.regexFilters = ['\\.mp4$', '/api/v\\d+/'];
      filter = new RequestFilter(settings);

      const mp4Result = filter.shouldLog('https://example.com/video.mp4', 'media');
      const apiResult = filter.shouldLog('https://example.com/api/v1/users', 'xmlhttprequest');
      const otherResult = filter.shouldLog('https://example.com/page.html', 'main_frame');

      expect(mp4Result).toBe(true);
      expect(apiResult).toBe(true);
      expect(otherResult).toBe(false);
    });

    it('should allow all when no filters are set', () => {
      settings.simpleFilters = [];
      settings.regexFilters = [];
      settings.allowList = [];
      settings.denyList = [];
      settings.resourceTypes = [];
      filter = new RequestFilter(settings);

      const result = filter.shouldLog('https://example.com/anything', 'any_type');

      expect(result).toBe(true);
    });

    it('should prioritize deny list over allow list', () => {
      settings.allowList = ['*.example.com'];
      settings.denyList = ['*.ads.example.com'];
      filter = new RequestFilter(settings);

      const deniedResult = filter.shouldLog('https://ads.example.com/ad', 'script');
      const allowedResult = filter.shouldLog('https://api.example.com/data', 'xmlhttprequest');

      expect(deniedResult).toBe(false);
      expect(allowedResult).toBe(true);
    });
  });

  describe('updateSettings', () => {
    it('should update filter settings', () => {
      settings.simpleFilters = ['.mp4'];
      filter = new RequestFilter(settings);

      expect(filter.shouldLog('https://example.com/video.mp4', 'media')).toBe(true);
      expect(filter.shouldLog('https://example.com/video.webm', 'media')).toBe(false);

      filter.updateSettings({ ...settings, simpleFilters: ['.webm'] });

      expect(filter.shouldLog('https://example.com/video.mp4', 'media')).toBe(false);
      expect(filter.shouldLog('https://example.com/video.webm', 'media')).toBe(true);
    });
  });
});

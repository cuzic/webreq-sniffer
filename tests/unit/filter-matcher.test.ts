/**
 * Filter Matcher Tests
 * TDD for real-time filter preview matching logic
 */

import { describe, it, expect } from 'vitest';
import type { LogEntry } from '@/types';
import { countMatchingEntries, matchesFilter } from '@/lib/filter-matcher';

describe('Filter Matcher', () => {
  const sampleEntries: LogEntry[] = [
    {
      id: '1',
      url: 'https://example.com/video.mp4',
      type: 'media',
      method: 'GET',
      timestamp: Date.now(),
      tabId: 1,
      headers: {},
    },
    {
      id: '2',
      url: 'https://example.com/image.png',
      type: 'image',
      method: 'GET',
      timestamp: Date.now(),
      tabId: 1,
      headers: {},
    },
    {
      id: '3',
      url: 'https://api.example.com/data.json',
      type: 'xmlhttprequest',
      method: 'GET',
      timestamp: Date.now(),
      tabId: 1,
      headers: {},
    },
    {
      id: '4',
      url: 'https://example.com/script.js',
      type: 'script',
      method: 'GET',
      timestamp: Date.now(),
      tabId: 1,
      headers: {},
    },
    {
      id: '5',
      url: 'https://cdn.example.com/video.m3u8',
      type: 'media',
      method: 'GET',
      timestamp: Date.now(),
      tabId: 1,
      headers: {},
    },
  ];

  describe('matchesFilter', () => {
    describe('Search term filtering', () => {
      it('should match entry when URL contains search term', () => {
        const entry = sampleEntries[0];
        expect(matchesFilter(entry, { searchTerm: 'video', filterType: 'all' })).toBe(true);
      });

      it('should match entry with case-insensitive search', () => {
        const entry = sampleEntries[0];
        expect(matchesFilter(entry, { searchTerm: 'VIDEO', filterType: 'all' })).toBe(true);
      });

      it('should not match entry when URL does not contain search term', () => {
        const entry = sampleEntries[0];
        expect(matchesFilter(entry, { searchTerm: 'image', filterType: 'all' })).toBe(false);
      });

      it('should match all entries when search term is empty', () => {
        sampleEntries.forEach((entry) => {
          expect(matchesFilter(entry, { searchTerm: '', filterType: 'all' })).toBe(true);
        });
      });

      it('should handle partial URL matches', () => {
        const entry = sampleEntries[2]; // api.example.com
        expect(matchesFilter(entry, { searchTerm: 'api', filterType: 'all' })).toBe(true);
      });
    });

    describe('Resource type filtering', () => {
      it('should match entry when type matches filter', () => {
        const entry = sampleEntries[0]; // media type
        expect(matchesFilter(entry, { searchTerm: '', filterType: 'media' })).toBe(true);
      });

      it('should not match entry when type does not match filter', () => {
        const entry = sampleEntries[0]; // media type
        expect(matchesFilter(entry, { searchTerm: '', filterType: 'image' })).toBe(false);
      });

      it('should match all entries when filter type is "all"', () => {
        sampleEntries.forEach((entry) => {
          expect(matchesFilter(entry, { searchTerm: '', filterType: 'all' })).toBe(true);
        });
      });
    });

    describe('Combined filtering', () => {
      it('should match when both search term and type match', () => {
        const entry = sampleEntries[0]; // video.mp4, media type
        expect(matchesFilter(entry, { searchTerm: 'video', filterType: 'media' })).toBe(true);
      });

      it('should not match when search term matches but type does not', () => {
        const entry = sampleEntries[0]; // video.mp4, media type
        expect(matchesFilter(entry, { searchTerm: 'video', filterType: 'image' })).toBe(false);
      });

      it('should not match when type matches but search term does not', () => {
        const entry = sampleEntries[0]; // video.mp4, media type
        expect(matchesFilter(entry, { searchTerm: 'image', filterType: 'media' })).toBe(false);
      });
    });
  });

  describe('countMatchingEntries', () => {
    it('should count all entries when no filters applied', () => {
      const count = countMatchingEntries(sampleEntries, { searchTerm: '', filterType: 'all' });
      expect(count).toBe(5);
    });

    it('should count entries matching search term', () => {
      const count = countMatchingEntries(sampleEntries, { searchTerm: 'video', filterType: 'all' });
      expect(count).toBe(2); // video.mp4 and video.m3u8
    });

    it('should count entries matching resource type', () => {
      const count = countMatchingEntries(sampleEntries, { searchTerm: '', filterType: 'media' });
      expect(count).toBe(2); // 2 media entries
    });

    it('should count entries matching both filters', () => {
      const count = countMatchingEntries(sampleEntries, {
        searchTerm: 'https://example.com',
        filterType: 'media',
      });
      expect(count).toBe(1); // Only https://example.com/video.mp4 (not cdn or api subdomain)
    });

    it('should return 0 when no entries match', () => {
      const count = countMatchingEntries(sampleEntries, {
        searchTerm: 'nonexistent',
        filterType: 'all',
      });
      expect(count).toBe(0);
    });

    it('should handle empty entries array', () => {
      const count = countMatchingEntries([], { searchTerm: '', filterType: 'all' });
      expect(count).toBe(0);
    });

    it('should count case-insensitive matches', () => {
      const count = countMatchingEntries(sampleEntries, { searchTerm: 'API', filterType: 'all' });
      expect(count).toBe(1); // api.example.com
    });
  });

  describe('Performance', () => {
    it('should handle large entry lists efficiently', () => {
      // Create 1000 entries
      const largeList: LogEntry[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        url: `https://example.com/file${i}.mp4`,
        type: 'media',
        method: 'GET',
        timestamp: Date.now(),
        tabId: 1,
        headers: {},
      }));

      const start = performance.now();
      const count = countMatchingEntries(largeList, { searchTerm: 'file5', filterType: 'all' });
      const duration = performance.now() - start;

      // Should match file5, file50-59, file500-599
      expect(count).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
  });
});

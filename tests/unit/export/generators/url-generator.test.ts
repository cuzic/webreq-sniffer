/**
 * Unit Tests for URL Generator
 */

import { describe, it, expect } from 'vitest';
import { generateUrlList } from '@/lib/export/generators/url-generator';
import type { LogEntry } from '@/types';

describe('URL Generator', () => {
  const mockEntries: LogEntry[] = [
    {
      id: '1',
      requestId: 'req1',
      url: 'https://example.com/video.m3u8',
      method: 'GET',
      type: 'media',
      tabId: 1,
      frameId: 0,
      timestamp: Date.now(),
      dedupeKey: 'key1',
    },
    {
      id: '2',
      requestId: 'req2',
      url: 'https://cdn.example.com/segment.ts',
      method: 'GET',
      type: 'media',
      tabId: 1,
      frameId: 0,
      timestamp: Date.now(),
      dedupeKey: 'key2',
    },
  ];

  describe('generateUrlList', () => {
    it('should generate plain URL list', () => {
      const result = generateUrlList(mockEntries);
      expect(result).toContain('https://example.com/video.m3u8');
      expect(result).toContain('https://cdn.example.com/segment.ts');
      expect(result.endsWith('\n')).toBe(true);
    });

    it('should separate URLs with newlines', () => {
      const result = generateUrlList(mockEntries);
      const lines = result.trim().split('\n');
      expect(lines).toHaveLength(2);
    });

    it('should handle empty entries', () => {
      const result = generateUrlList([]);
      expect(result).toBe('\n');
    });

    it('should handle single entry', () => {
      const result = generateUrlList([mockEntries[0]]);
      expect(result).toBe('https://example.com/video.m3u8\n');
    });

    it('should preserve URL order', () => {
      const result = generateUrlList(mockEntries);
      const lines = result.trim().split('\n');
      expect(lines[0]).toBe('https://example.com/video.m3u8');
      expect(lines[1]).toBe('https://cdn.example.com/segment.ts');
    });
  });
});

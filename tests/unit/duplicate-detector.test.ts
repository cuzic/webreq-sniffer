/**
 * Duplicate Detector Tests
 * TDD for duplicate request detection and removal
 */

import { describe, it, expect } from 'vitest';
import type { LogEntry } from '@/types';
import {
  detectDuplicates,
  removeDuplicates,
  groupDuplicates,
  countDuplicates,
  DuplicateStrategy,
} from '@/lib/duplicate-detector';

describe('Duplicate Detector', () => {
  const createEntry = (id: string, url: string, method: string = 'GET'): LogEntry => ({
    id,
    url,
    method,
    type: 'xmlhttprequest',
    timestamp: Date.now(),
    tabId: 1,
    headers: {},
  });

  describe('detectDuplicates', () => {
    it('should detect duplicate URLs with same method', () => {
      const entries = [
        createEntry('1', 'https://api.example.com/data', 'GET'),
        createEntry('2', 'https://api.example.com/data', 'GET'),
        createEntry('3', 'https://api.example.com/other', 'GET'),
      ];

      const duplicates = detectDuplicates(entries);

      expect(duplicates).toHaveProperty('1');
      expect(duplicates).toHaveProperty('2');
      expect(duplicates).not.toHaveProperty('3');
    });

    it('should not mark entries as duplicates if methods differ', () => {
      const entries = [
        createEntry('1', 'https://api.example.com/data', 'GET'),
        createEntry('2', 'https://api.example.com/data', 'POST'),
      ];

      const duplicates = detectDuplicates(entries);

      expect(Object.keys(duplicates)).toHaveLength(0);
    });

    it('should handle empty array', () => {
      const duplicates = detectDuplicates([]);
      expect(Object.keys(duplicates)).toHaveLength(0);
    });

    it('should handle single entry', () => {
      const entries = [createEntry('1', 'https://api.example.com/data', 'GET')];
      const duplicates = detectDuplicates(entries);
      expect(Object.keys(duplicates)).toHaveLength(0);
    });

    it('should detect multiple duplicate groups', () => {
      const entries = [
        createEntry('1', 'https://api.example.com/data', 'GET'),
        createEntry('2', 'https://api.example.com/data', 'GET'),
        createEntry('3', 'https://api.example.com/other', 'GET'),
        createEntry('4', 'https://api.example.com/other', 'GET'),
        createEntry('5', 'https://api.example.com/unique', 'GET'),
      ];

      const duplicates = detectDuplicates(entries);

      // Entries 1, 2, 3, 4 should be marked as duplicates
      expect(Object.keys(duplicates)).toHaveLength(4);
      expect(duplicates['5']).toBeUndefined();
    });

    it('should include duplicate group info', () => {
      const entries = [
        createEntry('1', 'https://api.example.com/data', 'GET'),
        createEntry('2', 'https://api.example.com/data', 'GET'),
      ];

      const duplicates = detectDuplicates(entries);

      expect(duplicates['1']).toHaveProperty('groupId');
      expect(duplicates['2']).toHaveProperty('groupId');
      expect(duplicates['1'].groupId).toBe(duplicates['2'].groupId);
      expect(duplicates['1']).toHaveProperty('count', 2);
    });
  });

  describe('countDuplicates', () => {
    it('should count total duplicate entries', () => {
      const entries = [
        createEntry('1', 'https://api.example.com/data', 'GET'),
        createEntry('2', 'https://api.example.com/data', 'GET'),
        createEntry('3', 'https://api.example.com/other', 'GET'),
      ];

      const count = countDuplicates(entries);
      expect(count).toBe(2); // 2 duplicates
    });

    it('should return 0 for no duplicates', () => {
      const entries = [
        createEntry('1', 'https://api.example.com/data', 'GET'),
        createEntry('2', 'https://api.example.com/other', 'GET'),
      ];

      const count = countDuplicates(entries);
      expect(count).toBe(0);
    });

    it('should handle empty array', () => {
      const count = countDuplicates([]);
      expect(count).toBe(0);
    });
  });

  describe('groupDuplicates', () => {
    it('should group entries by URL and method', () => {
      const entries = [
        createEntry('1', 'https://api.example.com/data', 'GET'),
        createEntry('2', 'https://api.example.com/data', 'GET'),
        createEntry('3', 'https://api.example.com/other', 'GET'),
        createEntry('4', 'https://api.example.com/other', 'GET'),
      ];

      const groups = groupDuplicates(entries);

      expect(groups.size).toBe(2);
      expect(groups.get('GET:https://api.example.com/data')).toHaveLength(2);
      expect(groups.get('GET:https://api.example.com/other')).toHaveLength(2);
    });

    it('should not group entries with different methods', () => {
      const entries = [
        createEntry('1', 'https://api.example.com/data', 'GET'),
        createEntry('2', 'https://api.example.com/data', 'POST'),
      ];

      const groups = groupDuplicates(entries);

      expect(groups.size).toBe(2);
      expect(groups.get('GET:https://api.example.com/data')).toHaveLength(1);
      expect(groups.get('POST:https://api.example.com/data')).toHaveLength(1);
    });
  });

  describe('removeDuplicates', () => {
    describe('Strategy: KEEP_FIRST', () => {
      it('should keep first occurrence and remove rest', () => {
        const entries = [
          createEntry('1', 'https://api.example.com/data', 'GET'),
          createEntry('2', 'https://api.example.com/data', 'GET'),
          createEntry('3', 'https://api.example.com/data', 'GET'),
        ];

        const result = removeDuplicates(entries, DuplicateStrategy.KEEP_FIRST);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
      });

      it('should preserve non-duplicate entries', () => {
        const entries = [
          createEntry('1', 'https://api.example.com/data', 'GET'),
          createEntry('2', 'https://api.example.com/data', 'GET'),
          createEntry('3', 'https://api.example.com/other', 'GET'),
        ];

        const result = removeDuplicates(entries, DuplicateStrategy.KEEP_FIRST);

        expect(result).toHaveLength(2);
        expect(result.map((e) => e.id)).toEqual(['1', '3']);
      });
    });

    describe('Strategy: KEEP_LAST', () => {
      it('should keep last occurrence and remove rest', () => {
        const entries = [
          createEntry('1', 'https://api.example.com/data', 'GET'),
          createEntry('2', 'https://api.example.com/data', 'GET'),
          createEntry('3', 'https://api.example.com/data', 'GET'),
        ];

        const result = removeDuplicates(entries, DuplicateStrategy.KEEP_LAST);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('3');
      });

      it('should preserve non-duplicate entries', () => {
        const entries = [
          createEntry('1', 'https://api.example.com/data', 'GET'),
          createEntry('2', 'https://api.example.com/data', 'GET'),
          createEntry('3', 'https://api.example.com/other', 'GET'),
        ];

        const result = removeDuplicates(entries, DuplicateStrategy.KEEP_LAST);

        expect(result).toHaveLength(2);
        expect(result.map((e) => e.id)).toEqual(['2', '3']);
      });
    });

    it('should handle empty array', () => {
      const result = removeDuplicates([], DuplicateStrategy.KEEP_FIRST);
      expect(result).toHaveLength(0);
    });

    it('should handle array with no duplicates', () => {
      const entries = [
        createEntry('1', 'https://api.example.com/data', 'GET'),
        createEntry('2', 'https://api.example.com/other', 'GET'),
      ];

      const result = removeDuplicates(entries, DuplicateStrategy.KEEP_FIRST);
      expect(result).toHaveLength(2);
    });

    it('should handle multiple duplicate groups', () => {
      const entries = [
        createEntry('1', 'https://api.example.com/data', 'GET'),
        createEntry('2', 'https://api.example.com/data', 'GET'),
        createEntry('3', 'https://api.example.com/other', 'GET'),
        createEntry('4', 'https://api.example.com/other', 'GET'),
        createEntry('5', 'https://api.example.com/unique', 'GET'),
      ];

      const result = removeDuplicates(entries, DuplicateStrategy.KEEP_FIRST);

      expect(result).toHaveLength(3); // First of each group + unique
      expect(result.map((e) => e.id)).toEqual(['1', '3', '5']);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const entries: LogEntry[] = [];
      for (let i = 0; i < 1000; i++) {
        entries.push(createEntry(`${i}`, `https://api.example.com/data${i % 100}`, 'GET'));
      }

      const start = performance.now();
      const duplicates = detectDuplicates(entries);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100); // Should complete within 100ms
      expect(Object.keys(duplicates).length).toBeGreaterThan(0);
    });
  });
});

/**
 * Unit Tests for Logging Logic
 */

import { describe, it, expect } from 'vitest';
import { generateDedupeKey, isDuplicate, createLogEntry } from '@/background/logging';
import type { LogEntry } from '@/types';

describe('Logging Logic', () => {
  describe('generateDedupeKey', () => {
    it('should generate consistent key for same URL and headers', () => {
      const headers = {
        Referer: 'https://example.com',
        Origin: 'https://example.com',
      };
      const key1 = generateDedupeKey('https://example.com/video.m3u8', headers);
      const key2 = generateDedupeKey('https://example.com/video.m3u8', headers);
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different URLs', () => {
      const headers = { Referer: 'https://example.com' };
      const key1 = generateDedupeKey('https://example.com/video1.m3u8', headers);
      const key2 = generateDedupeKey('https://example.com/video2.m3u8', headers);
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different headers', () => {
      const url = 'https://example.com/video.m3u8';
      const key1 = generateDedupeKey(url, { Referer: 'https://example.com' });
      const key2 = generateDedupeKey(url, { Referer: 'https://other.com' });
      expect(key1).not.toBe(key2);
    });

    it('should handle missing headers', () => {
      const key1 = generateDedupeKey('https://example.com/test', undefined);
      const key2 = generateDedupeKey('https://example.com/test', {});
      expect(key1).toBe(key2);
    });

    it('should include Referer and Origin in key generation', () => {
      const url = 'https://example.com/test';
      const key1 = generateDedupeKey(url, {});
      const key2 = generateDedupeKey(url, { Referer: 'https://example.com' });
      const key3 = generateDedupeKey(url, { Origin: 'https://example.com' });
      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });

    it('should return base36 string', () => {
      const key = generateDedupeKey('https://example.com/test', {});
      expect(typeof key).toBe('string');
      expect(/^[0-9a-z-]+$/.test(key)).toBe(true);
    });
  });

  describe('isDuplicate', () => {
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
        url: 'https://example.com/segment.ts',
        method: 'GET',
        type: 'media',
        tabId: 1,
        frameId: 0,
        timestamp: Date.now(),
        dedupeKey: 'key2',
      },
    ];

    it('should return true if dedupeKey exists in entries', () => {
      expect(isDuplicate('key1', mockEntries)).toBe(true);
      expect(isDuplicate('key2', mockEntries)).toBe(true);
    });

    it('should return false if dedupeKey does not exist in entries', () => {
      expect(isDuplicate('key3', mockEntries)).toBe(false);
      expect(isDuplicate('unknown', mockEntries)).toBe(false);
    });

    it('should return false for empty entries array', () => {
      expect(isDuplicate('key1', [])).toBe(false);
    });
  });

  describe('createLogEntry', () => {
    const mockDetails: chrome.webRequest.WebRequestDetails = {
      requestId: 'req123',
      url: 'https://example.com/video.m3u8',
      method: 'GET',
      frameId: 0,
      parentFrameId: -1,
      tabId: 1,
      type: 'media' as chrome.webRequest.ResourceType,
      timeStamp: 1234567890,
      initiator: 'https://example.com',
    };

    it('should create log entry from webRequest details', () => {
      const entry = createLogEntry(mockDetails);
      expect(entry.requestId).toBe('req123');
      expect(entry.url).toBe('https://example.com/video.m3u8');
      expect(entry.method).toBe('GET');
      expect(entry.type).toBe('media');
      expect(entry.tabId).toBe(1);
      expect(entry.frameId).toBe(0);
      expect(entry.timestamp).toBe(1234567890);
      expect(entry.initiator).toBe('https://example.com');
    });

    it('should generate unique ID', () => {
      const entry1 = createLogEntry(mockDetails);
      const entry2 = createLogEntry(mockDetails);
      expect(entry1.id).not.toBe(entry2.id);
      expect(typeof entry1.id).toBe('string');
      expect(entry1.id.length).toBeGreaterThan(0);
    });

    it('should generate dedupeKey', () => {
      const entry = createLogEntry(mockDetails);
      expect(entry.dedupeKey).toBeDefined();
      expect(typeof entry.dedupeKey).toBe('string');
    });

    it('should include headers when provided', () => {
      const headers: chrome.webRequest.HttpHeader[] = [
        { name: 'User-Agent', value: 'Mozilla/5.0' },
        { name: 'Referer', value: 'https://example.com' },
      ];
      const entry = createLogEntry(mockDetails, headers);
      expect(entry.headers).toBeDefined();
      expect(entry.headers?.['User-Agent']).toBe('Mozilla/5.0');
      expect(entry.headers?.['Referer']).toBe('https://example.com');
    });

    it('should skip headers without name or value', () => {
      const headers: chrome.webRequest.HttpHeader[] = [
        { name: 'Valid', value: 'test' },
        { name: 'NoValue' },
        { value: 'NoName' },
      ];
      const entry = createLogEntry(mockDetails, headers);
      expect(entry.headers).toBeDefined();
      expect(entry.headers?.['Valid']).toBe('test');
      expect(entry.headers?.['NoValue']).toBeUndefined();
      expect(Object.keys(entry.headers || {}).length).toBe(1);
    });

    it('should omit headers field when no headers provided', () => {
      const entry = createLogEntry(mockDetails);
      expect(entry.headers).toBeUndefined();
    });

    it('should omit headers field when empty headers array', () => {
      const entry = createLogEntry(mockDetails, []);
      expect(entry.headers).toBeUndefined();
    });
  });
});

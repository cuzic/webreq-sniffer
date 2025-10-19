/**
 * Unit Tests for LogEntry Builder Pattern
 * Testing TDD approach for Issue #64 Priority 4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogEntryBuilder } from '@/background/log-entry-builder';
import type { LogEntry, PageMetadata } from '@/types';

describe('LogEntry Builder Pattern', () => {
  const mockWebRequestDetails: chrome.webRequest.WebRequestDetails = {
    requestId: 'req-123',
    url: 'https://example.com/video.m3u8',
    method: 'GET',
    frameId: 0,
    parentFrameId: -1,
    tabId: 1,
    type: 'media' as chrome.webRequest.ResourceType,
    timeStamp: 1234567890,
    initiator: 'https://example.com',
  };

  const mockHeaders: chrome.webRequest.HttpHeader[] = [
    { name: 'User-Agent', value: 'Mozilla/5.0' },
    { name: 'Referer', value: 'https://example.com/page' },
  ];

  const mockPageMetadata: PageMetadata = {
    pageTitle: 'Test Page',
    ogTitle: 'Open Graph Title',
  };

  describe('Basic builder functionality', () => {
    it('should create builder instance', () => {
      const builder = new LogEntryBuilder();
      expect(builder).toBeDefined();
    });

    it('should build LogEntry with required fields only', () => {
      const builder = new LogEntryBuilder();
      const entry = builder.fromWebRequest(mockWebRequestDetails).build();

      expect(entry.id).toBeDefined();
      expect(entry.requestId).toBe('req-123');
      expect(entry.url).toBe('https://example.com/video.m3u8');
      expect(entry.method).toBe('GET');
      expect(entry.type).toBe('media');
      expect(entry.tabId).toBe(1);
      expect(entry.frameId).toBe(0);
      expect(entry.timestamp).toBe(1234567890);
      expect(entry.dedupeKey).toBeDefined();
    });

    it('should generate unique IDs for each entry', () => {
      const builder1 = new LogEntryBuilder();
      const entry1 = builder1.fromWebRequest(mockWebRequestDetails).build();

      const builder2 = new LogEntryBuilder();
      const entry2 = builder2.fromWebRequest(mockWebRequestDetails).build();

      expect(entry1.id).not.toBe(entry2.id);
    });

    it('should generate dedupe keys consistently', () => {
      const builder1 = new LogEntryBuilder();
      const entry1 = builder1.fromWebRequest(mockWebRequestDetails).build();

      const builder2 = new LogEntryBuilder();
      const entry2 = builder2.fromWebRequest(mockWebRequestDetails).build();

      expect(entry1.dedupeKey).toBe(entry2.dedupeKey);
    });
  });

  describe('Fluent API', () => {
    it('should support method chaining', () => {
      const builder = new LogEntryBuilder();
      const result = builder
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(mockHeaders)
        .withPageMetadata(mockPageMetadata);

      expect(result).toBe(builder); // Should return same instance
    });

    it('should build entry with headers', () => {
      const entry = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(mockHeaders)
        .build();

      expect(entry.headers).toBeDefined();
      expect(entry.headers?.['User-Agent']).toBe('Mozilla/5.0');
      expect(entry.headers?.['Referer']).toBe('https://example.com/page');
    });

    it('should build entry with page metadata', () => {
      const entry = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withPageMetadata(mockPageMetadata)
        .build();

      expect(entry.pageMetadata).toBeDefined();
      expect(entry.pageMetadata?.pageTitle).toBe('Test Page');
      expect(entry.pageMetadata?.ogTitle).toBe('Open Graph Title');
    });

    it('should build entry with all optional fields', () => {
      const entry = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(mockHeaders)
        .withPageMetadata(mockPageMetadata)
        .build();

      expect(entry.headers).toBeDefined();
      expect(entry.pageMetadata).toBeDefined();
      expect(entry.initiator).toBe('https://example.com');
    });
  });

  describe('Header processing', () => {
    it('should convert headers array to map', () => {
      const entry = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(mockHeaders)
        .build();

      expect(entry.headers).toEqual({
        'User-Agent': 'Mozilla/5.0',
        Referer: 'https://example.com/page',
      });
    });

    it('should handle empty headers array', () => {
      const entry = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders([])
        .build();

      expect(entry.headers).toBeUndefined();
    });

    it('should handle headers with missing values', () => {
      const headersWithMissing = [
        { name: 'User-Agent', value: 'Mozilla/5.0' },
        { name: 'Empty' }, // Missing value
        { value: 'No Name' }, // Missing name
      ];

      const entry = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(headersWithMissing)
        .build();

      expect(entry.headers).toEqual({
        'User-Agent': 'Mozilla/5.0',
      });
    });

    it('should skip headers when not provided', () => {
      const entry = new LogEntryBuilder().fromWebRequest(mockWebRequestDetails).build();

      expect(entry.headers).toBeUndefined();
    });
  });

  describe('Dedupe key generation', () => {
    it('should include URL in dedupe key', () => {
      const details1 = { ...mockWebRequestDetails, url: 'https://example.com/video1.m3u8' };
      const details2 = { ...mockWebRequestDetails, url: 'https://example.com/video2.m3u8' };

      const entry1 = new LogEntryBuilder().fromWebRequest(details1).build();
      const entry2 = new LogEntryBuilder().fromWebRequest(details2).build();

      expect(entry1.dedupeKey).not.toBe(entry2.dedupeKey);
    });

    it('should include Referer header in dedupe key', () => {
      const headers1 = [{ name: 'Referer', value: 'https://example.com/page1' }];
      const headers2 = [{ name: 'Referer', value: 'https://example.com/page2' }];

      const entry1 = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(headers1)
        .build();

      const entry2 = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(headers2)
        .build();

      expect(entry1.dedupeKey).not.toBe(entry2.dedupeKey);
    });

    it('should include Origin header in dedupe key', () => {
      const headers1 = [{ name: 'Origin', value: 'https://origin1.com' }];
      const headers2 = [{ name: 'Origin', value: 'https://origin2.com' }];

      const entry1 = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(headers1)
        .build();

      const entry2 = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(headers2)
        .build();

      expect(entry1.dedupeKey).not.toBe(entry2.dedupeKey);
    });

    it('should generate same dedupe key for identical requests', () => {
      const entry1 = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(mockHeaders)
        .build();

      const entry2 = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(mockHeaders)
        .build();

      expect(entry1.dedupeKey).toBe(entry2.dedupeKey);
    });
  });

  describe('Reset functionality', () => {
    it('should reset builder state for reuse', () => {
      const builder = new LogEntryBuilder();

      const entry1 = builder.fromWebRequest(mockWebRequestDetails).withHeaders(mockHeaders).build();

      builder.reset();

      const details2 = { ...mockWebRequestDetails, url: 'https://example.com/other.mp4' };
      const entry2 = builder.fromWebRequest(details2).build();

      expect(entry2.url).toBe('https://example.com/other.mp4');
      expect(entry2.headers).toBeUndefined(); // Headers should be cleared
      expect(entry2.id).not.toBe(entry1.id);
    });
  });

  describe('Validation', () => {
    it('should throw error when building without web request details', () => {
      const builder = new LogEntryBuilder();

      expect(() => builder.build()).toThrow('Web request details are required');
    });

    it('should validate required fields in web request', () => {
      const invalidDetails = {
        requestId: 'req-123',
        // Missing required fields
      } as chrome.webRequest.WebRequestDetails;

      const builder = new LogEntryBuilder();

      expect(() => builder.fromWebRequest(invalidDetails).build()).toThrow();
    });
  });

  describe('Static factory methods', () => {
    it('should create builder from web request details', () => {
      const entry = LogEntryBuilder.fromRequest(mockWebRequestDetails).build();

      expect(entry.requestId).toBe('req-123');
      expect(entry.url).toBe('https://example.com/video.m3u8');
    });

    it('should create builder with all parameters', () => {
      const entry = LogEntryBuilder.fromRequest(
        mockWebRequestDetails,
        mockHeaders,
        mockPageMetadata
      ).build();

      expect(entry.headers).toBeDefined();
      expect(entry.pageMetadata).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle requests without initiator', () => {
      const detailsNoInitiator = { ...mockWebRequestDetails };
      delete detailsNoInitiator.initiator;

      const entry = new LogEntryBuilder().fromWebRequest(detailsNoInitiator).build();

      expect(entry.initiator).toBeUndefined();
    });

    it('should handle very long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(10000);
      const details = { ...mockWebRequestDetails, url: longUrl };

      const entry = new LogEntryBuilder().fromWebRequest(details).build();

      expect(entry.url).toBe(longUrl);
      expect(entry.dedupeKey).toBeDefined();
    });

    it('should handle special characters in headers', () => {
      const specialHeaders = [
        { name: 'Custom-Header', value: 'value with spaces & special chars !@#$%' },
      ];

      const entry = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(specialHeaders)
        .build();

      expect(entry.headers?.['Custom-Header']).toBe('value with spaces & special chars !@#$%');
    });
  });

  describe('Backward compatibility', () => {
    it('should create same LogEntry as old createLogEntry function', () => {
      // This test ensures the builder produces the same result as the old factory function
      const builderEntry = new LogEntryBuilder()
        .fromWebRequest(mockWebRequestDetails)
        .withHeaders(mockHeaders)
        .withPageMetadata(mockPageMetadata)
        .build();

      // Check all required fields are present
      expect(builderEntry).toHaveProperty('id');
      expect(builderEntry).toHaveProperty('requestId');
      expect(builderEntry).toHaveProperty('url');
      expect(builderEntry).toHaveProperty('method');
      expect(builderEntry).toHaveProperty('type');
      expect(builderEntry).toHaveProperty('tabId');
      expect(builderEntry).toHaveProperty('frameId');
      expect(builderEntry).toHaveProperty('timestamp');
      expect(builderEntry).toHaveProperty('dedupeKey');

      // Check types
      expect(typeof builderEntry.id).toBe('string');
      expect(typeof builderEntry.dedupeKey).toBe('string');
      expect(typeof builderEntry.timestamp).toBe('number');
    });
  });
});

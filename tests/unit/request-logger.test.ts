/**
 * Unit Tests for RequestLogger
 * TDD approach for request logging responsibility
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RequestLogger } from '@/background/request-logger';
import { MockStorageAdapter } from '@/lib/adapters/storage-adapter';
import { StateManager } from '@/background/state-manager';
import { defaultSettings, defaultLogData } from '@/types';
import type { Settings, LogData, LogEntry } from '@/types';

describe('RequestLogger', () => {
  let logger: RequestLogger;
  let stateManager: StateManager;
  let mockLocalAdapter: MockStorageAdapter;
  let mockSyncAdapter: MockStorageAdapter;
  let settings: Settings;

  beforeEach(() => {
    mockLocalAdapter = new MockStorageAdapter();
    mockSyncAdapter = new MockStorageAdapter();
    stateManager = new StateManager(mockLocalAdapter, mockSyncAdapter);
    settings = { ...defaultSettings };
  });

  describe('logRequest', () => {
    it('should create and store log entry', async () => {
      await mockLocalAdapter.set('logData', { ...defaultLogData, monitoringScope: 'allTabs' });
      await mockSyncAdapter.set('settings', settings);

      logger = new RequestLogger(stateManager);

      const details = {
        requestId: 'req-123',
        url: 'https://example.com/api/data',
        method: 'GET',
        type: 'xmlhttprequest',
        tabId: 1,
        frameId: 0,
        timeStamp: Date.now(),
        initiator: 'https://example.com',
      } as chrome.webRequest.WebRequestDetails;

      await logger.logRequest(details);

      const logData = await stateManager.getLogData(true);
      expect(logData.entries).toHaveLength(1);
      expect(logData.entries[0]?.url).toBe('https://example.com/api/data');
      expect(logData.entries[0]?.method).toBe('GET');
    });

    it('should include headers when provided', async () => {
      await mockLocalAdapter.set('logData', { ...defaultLogData, monitoringScope: 'allTabs' });
      await mockSyncAdapter.set('settings', settings);

      logger = new RequestLogger(stateManager);

      const details = {
        requestId: 'req-123',
        url: 'https://example.com/api/data',
        method: 'GET',
        type: 'xmlhttprequest',
        tabId: 1,
        frameId: 0,
        timeStamp: Date.now(),
        initiator: 'https://example.com',
      } as chrome.webRequest.WebRequestDetails;

      const headers: chrome.webRequest.HttpHeader[] = [
        { name: 'Referer', value: 'https://example.com' },
        { name: 'User-Agent', value: 'Mozilla/5.0' },
      ];

      await logger.logRequest(details, headers);

      const logData = await stateManager.getLogData(true);
      expect(logData.entries[0]?.headers).toBeDefined();
      expect(logData.entries[0]?.headers?.Referer).toBe('https://example.com');
      expect(logData.entries[0]?.headers?.['User-Agent']).toBe('Mozilla/5.0');
    });

    it('should skip duplicate entries', async () => {
      await mockLocalAdapter.set('logData', { ...defaultLogData, monitoringScope: 'allTabs' });
      await mockSyncAdapter.set('settings', settings);

      logger = new RequestLogger(stateManager);

      const details = {
        requestId: 'req-123',
        url: 'https://example.com/api/data',
        method: 'GET',
        type: 'xmlhttprequest',
        tabId: 1,
        frameId: 0,
        timeStamp: Date.now(),
        initiator: 'https://example.com',
      } as chrome.webRequest.WebRequestDetails;

      const headers: chrome.webRequest.HttpHeader[] = [
        { name: 'Referer', value: 'https://example.com' },
      ];

      // Log same request twice
      await logger.logRequest(details, headers);
      await logger.logRequest(details, headers);

      const logData = await stateManager.getLogData(true);
      expect(logData.entries).toHaveLength(1);
    });

    it('should enforce ring buffer limit', async () => {
      settings.limits.maxEntries = 5;
      await mockLocalAdapter.set('logData', { ...defaultLogData, monitoringScope: 'allTabs' });
      await mockSyncAdapter.set('settings', settings);

      logger = new RequestLogger(stateManager);

      // Add 7 entries
      for (let i = 0; i < 7; i++) {
        const details = {
          requestId: `req-${i}`,
          url: `https://example.com/api/data${i}`,
          method: 'GET',
          type: 'xmlhttprequest',
          tabId: 1,
          frameId: 0,
          timeStamp: Date.now() + i,
          initiator: 'https://example.com',
        } as chrome.webRequest.WebRequestDetails;

        await logger.logRequest(details);
      }

      const logData = await stateManager.getLogData(true);
      expect(logData.entries).toHaveLength(5);
      // Should keep the latest 5 (entries 2-6)
      expect(logData.entries[0]?.url).toBe('https://example.com/api/data2');
      expect(logData.entries[4]?.url).toBe('https://example.com/api/data6');
    });

    it('should generate unique IDs for each entry', async () => {
      await mockLocalAdapter.set('logData', { ...defaultLogData, monitoringScope: 'allTabs' });
      await mockSyncAdapter.set('settings', settings);

      logger = new RequestLogger(stateManager);

      const details1 = {
        requestId: 'req-1',
        url: 'https://example.com/api/1',
        method: 'GET',
        type: 'xmlhttprequest',
        tabId: 1,
        frameId: 0,
        timeStamp: Date.now(),
        initiator: 'https://example.com',
      } as chrome.webRequest.WebRequestDetails;

      const details2 = {
        requestId: 'req-2',
        url: 'https://example.com/api/2',
        method: 'GET',
        type: 'xmlhttprequest',
        tabId: 1,
        frameId: 0,
        timeStamp: Date.now(),
        initiator: 'https://example.com',
      } as chrome.webRequest.WebRequestDetails;

      await logger.logRequest(details1);
      await logger.logRequest(details2);

      const logData = await stateManager.getLogData(true);
      expect(logData.entries[0]?.id).not.toBe(logData.entries[1]?.id);
    });

    it('should generate dedupe keys for duplicate detection', async () => {
      await mockLocalAdapter.set('logData', { ...defaultLogData, monitoringScope: 'allTabs' });
      await mockSyncAdapter.set('settings', settings);

      logger = new RequestLogger(stateManager);

      const details = {
        requestId: 'req-123',
        url: 'https://example.com/api/data',
        method: 'GET',
        type: 'xmlhttprequest',
        tabId: 1,
        frameId: 0,
        timeStamp: Date.now(),
        initiator: 'https://example.com',
      } as chrome.webRequest.WebRequestDetails;

      await logger.logRequest(details);

      const logData = await stateManager.getLogData(true);
      expect(logData.entries[0]?.dedupeKey).toBeDefined();
      expect(typeof logData.entries[0]?.dedupeKey).toBe('string');
    });
  });
});

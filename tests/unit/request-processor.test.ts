/**
 * Unit Tests for RequestProcessor
 * TDD approach for coordinating request processing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RequestProcessor } from '@/background/request-processor';
import { RequestLogger } from '@/background/request-logger';
import { MockStorageAdapter } from '@/lib/adapters/storage-adapter';
import { StateManager } from '@/background/state-manager';
import { defaultSettings, defaultLogData } from '@/types';
import type { Settings, LogData } from '@/types';

describe('RequestProcessor', () => {
  let processor: RequestProcessor;
  let stateManager: StateManager;
  let logger: RequestLogger;
  let mockLocalAdapter: MockStorageAdapter;
  let mockSyncAdapter: MockStorageAdapter;

  beforeEach(() => {
    mockLocalAdapter = new MockStorageAdapter();
    mockSyncAdapter = new MockStorageAdapter();
    stateManager = new StateManager(mockLocalAdapter, mockSyncAdapter);
  });

  describe('processRequest', () => {
    it('should skip when monitoring is disabled', async () => {
      const logData: LogData = {
        ...defaultLogData,
        isMonitoring: false,
      };
      await mockLocalAdapter.set('logData', logData);
      await mockSyncAdapter.set('settings', defaultSettings);

      logger = new RequestLogger(stateManager);
      processor = new RequestProcessor(stateManager, logger);

      const logSpy = vi.spyOn(logger, 'logRequest');

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

      await processor.processRequest(details);

      expect(logSpy).not.toHaveBeenCalled();
    });

    it('should skip when monitoring scope is activeTab and request is from different tab', async () => {
      const logData: LogData = {
        ...defaultLogData,
        isMonitoring: true,
        monitoringScope: 'activeTab',
        activeTabId: 1,
      };
      await mockLocalAdapter.set('logData', logData);
      await mockSyncAdapter.set('settings', defaultSettings);

      logger = new RequestLogger(stateManager);
      processor = new RequestProcessor(stateManager, logger);

      const logSpy = vi.spyOn(logger, 'logRequest');

      const details = {
        requestId: 'req-123',
        url: 'https://example.com/api/data',
        method: 'GET',
        type: 'xmlhttprequest',
        tabId: 2, // Different tab
        frameId: 0,
        timeStamp: Date.now(),
        initiator: 'https://example.com',
      } as chrome.webRequest.WebRequestDetails;

      await processor.processRequest(details);

      expect(logSpy).not.toHaveBeenCalled();
    });

    it('should process when monitoring scope is activeTab and request is from active tab', async () => {
      const logData: LogData = {
        ...defaultLogData,
        isMonitoring: true,
        monitoringScope: 'activeTab',
        activeTabId: 1,
      };
      await mockLocalAdapter.set('logData', logData);
      await mockSyncAdapter.set('settings', defaultSettings);

      logger = new RequestLogger(stateManager);
      processor = new RequestProcessor(stateManager, logger);

      const logSpy = vi.spyOn(logger, 'logRequest');

      const details = {
        requestId: 'req-123',
        url: 'https://example.com/api/data',
        method: 'GET',
        type: 'xmlhttprequest',
        tabId: 1, // Same tab
        frameId: 0,
        timeStamp: Date.now(),
        initiator: 'https://example.com',
      } as chrome.webRequest.WebRequestDetails;

      await processor.processRequest(details);

      expect(logSpy).toHaveBeenCalledWith(details, undefined, undefined);
    });

    it('should process when monitoring scope is allTabs', async () => {
      const logData: LogData = {
        ...defaultLogData,
        isMonitoring: true,
        monitoringScope: 'allTabs',
      };
      await mockLocalAdapter.set('logData', logData);
      await mockSyncAdapter.set('settings', defaultSettings);

      logger = new RequestLogger(stateManager);
      processor = new RequestProcessor(stateManager, logger);

      const logSpy = vi.spyOn(logger, 'logRequest');

      const details = {
        requestId: 'req-123',
        url: 'https://example.com/api/data',
        method: 'GET',
        type: 'xmlhttprequest',
        tabId: 999,
        frameId: 0,
        timeStamp: Date.now(),
        initiator: 'https://example.com',
      } as chrome.webRequest.WebRequestDetails;

      await processor.processRequest(details);

      expect(logSpy).toHaveBeenCalledWith(details, undefined, undefined);
    });

    it('should skip when request does not match filter', async () => {
      const settings: Settings = {
        ...defaultSettings,
        simpleFilters: ['.mp4'],
      };
      const logData: LogData = {
        ...defaultLogData,
        isMonitoring: true,
        monitoringScope: 'allTabs',
      };
      await mockLocalAdapter.set('logData', logData);
      await mockSyncAdapter.set('settings', settings);

      logger = new RequestLogger(stateManager);
      processor = new RequestProcessor(stateManager, logger);

      const logSpy = vi.spyOn(logger, 'logRequest');

      const details = {
        requestId: 'req-123',
        url: 'https://example.com/api/data', // Doesn't match .mp4
        method: 'GET',
        type: 'xmlhttprequest',
        tabId: 1,
        frameId: 0,
        timeStamp: Date.now(),
        initiator: 'https://example.com',
      } as chrome.webRequest.WebRequestDetails;

      await processor.processRequest(details);

      expect(logSpy).not.toHaveBeenCalled();
    });

    it('should process when request matches filter', async () => {
      const settings: Settings = {
        ...defaultSettings,
        simpleFilters: ['.mp4'],
      };
      const logData: LogData = {
        ...defaultLogData,
        isMonitoring: true,
        monitoringScope: 'allTabs',
      };
      await mockLocalAdapter.set('logData', logData);
      await mockSyncAdapter.set('settings', settings);

      logger = new RequestLogger(stateManager);
      processor = new RequestProcessor(stateManager, logger);

      const logSpy = vi.spyOn(logger, 'logRequest');

      const details = {
        requestId: 'req-123',
        url: 'https://example.com/video.mp4', // Matches .mp4
        method: 'GET',
        type: 'media',
        tabId: 1,
        frameId: 0,
        timeStamp: Date.now(),
        initiator: 'https://example.com',
      } as chrome.webRequest.WebRequestDetails;

      await processor.processRequest(details);

      expect(logSpy).toHaveBeenCalledWith(details, undefined, undefined);
    });

    it('should handle errors gracefully', async () => {
      const logData: LogData = {
        ...defaultLogData,
        isMonitoring: true,
        monitoringScope: 'allTabs',
      };
      await mockLocalAdapter.set('logData', logData);
      await mockSyncAdapter.set('settings', defaultSettings);

      logger = new RequestLogger(stateManager);
      processor = new RequestProcessor(stateManager, logger);

      // Force an error
      vi.spyOn(logger, 'logRequest').mockRejectedValue(new Error('Storage error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

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

      // Should not throw
      await expect(processor.processRequest(details)).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should pass headers when provided', async () => {
      const logData: LogData = {
        ...defaultLogData,
        isMonitoring: true,
        monitoringScope: 'allTabs',
      };
      await mockLocalAdapter.set('logData', logData);
      await mockSyncAdapter.set('settings', defaultSettings);

      logger = new RequestLogger(stateManager);
      processor = new RequestProcessor(stateManager, logger);

      const logSpy = vi.spyOn(logger, 'logRequest');

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

      await processor.processRequest(details, headers);

      expect(logSpy).toHaveBeenCalledWith(details, headers, undefined);
    });
  });
});

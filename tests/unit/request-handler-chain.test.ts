/**
 * Unit Tests for Chain of Responsibility Pattern
 * Testing TDD approach for Issue #64 Priority 3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { RequestHandler, RequestContext } from '@/background/request-handler-chain';
import {
  MonitoringCheckHandler,
  FilteringHandler,
  LoggingHandler,
  RequestHandlerChain,
} from '@/background/request-handler-chain';
import type { StateManager } from '@/background/state-manager';
import type { RequestLogger } from '@/background/request-logger';
import type { Settings, LogData } from '@/types';

describe('Chain of Responsibility Pattern', () => {
  // Mock dependencies
  let mockStateManager: StateManager;
  let mockLogger: RequestLogger;
  let mockContext: RequestContext;

  beforeEach(() => {
    // Mock StateManager
    mockStateManager = {
      getLogData: vi.fn(),
      getSettings: vi.fn(),
    } as unknown as StateManager;

    // Mock RequestLogger
    mockLogger = {
      logRequest: vi.fn(),
    } as unknown as RequestLogger;

    // Mock RequestContext
    mockContext = {
      details: {
        requestId: 'req-1',
        url: 'https://example.com/video.m3u8',
        method: 'GET',
        frameId: 0,
        parentFrameId: -1,
        tabId: 1,
        type: 'media' as chrome.webRequest.ResourceType,
        timeStamp: Date.now(),
      },
      headers: [{ name: 'User-Agent', value: 'Mozilla/5.0' }],
      pageMetadata: {
        pageTitle: 'Test Page',
      },
    };
  });

  describe('RequestHandler interface', () => {
    it('should define handler with setNext and handle methods', () => {
      class TestHandler implements RequestHandler {
        private nextHandler: RequestHandler | null = null;

        setNext(handler: RequestHandler): RequestHandler {
          this.nextHandler = handler;
          return handler;
        }

        async handle(context: RequestContext): Promise<void> {
          if (this.nextHandler) {
            await this.nextHandler.handle(context);
          }
        }
      }

      const handler = new TestHandler();
      expect(handler).toBeDefined();
      expect(handler.setNext).toBeTypeOf('function');
      expect(handler.handle).toBeTypeOf('function');
    });
  });

  describe('MonitoringCheckHandler', () => {
    it('should stop chain when monitoring is disabled', async () => {
      vi.mocked(mockStateManager.getLogData).mockResolvedValue({
        isMonitoring: false,
        monitoringScope: 'activeTab',
        entries: [],
        activeTabId: 1,
      } as LogData);

      const handler = new MonitoringCheckHandler(mockStateManager);
      const nextHandler = vi.fn();
      handler.setNext({ handle: nextHandler, setNext: vi.fn() } as RequestHandler);

      await handler.handle(mockContext);

      // Should NOT call next handler when monitoring is disabled
      expect(nextHandler).not.toHaveBeenCalled();
    });

    it('should continue chain when monitoring is enabled for active tab', async () => {
      vi.mocked(mockStateManager.getLogData).mockResolvedValue({
        isMonitoring: true,
        monitoringScope: 'activeTab',
        entries: [],
        activeTabId: 1,
      } as LogData);

      const handler = new MonitoringCheckHandler(mockStateManager);
      const nextHandler = vi.fn();
      handler.setNext({ handle: nextHandler, setNext: vi.fn() } as RequestHandler);

      await handler.handle(mockContext);

      // Should call next handler
      expect(nextHandler).toHaveBeenCalledWith(mockContext);
    });

    it('should stop chain when monitoring active tab but request is from different tab', async () => {
      vi.mocked(mockStateManager.getLogData).mockResolvedValue({
        isMonitoring: true,
        monitoringScope: 'activeTab',
        entries: [],
        activeTabId: 2, // Different tab
      } as LogData);

      const handler = new MonitoringCheckHandler(mockStateManager);
      const nextHandler = vi.fn();
      handler.setNext({ handle: nextHandler, setNext: vi.fn() } as RequestHandler);

      await handler.handle(mockContext);

      // Should NOT call next handler
      expect(nextHandler).not.toHaveBeenCalled();
    });

    it('should continue chain when monitoring all tabs', async () => {
      vi.mocked(mockStateManager.getLogData).mockResolvedValue({
        isMonitoring: true,
        monitoringScope: 'allTabs',
        entries: [],
        activeTabId: 2,
      } as LogData);

      const handler = new MonitoringCheckHandler(mockStateManager);
      const nextHandler = vi.fn();
      handler.setNext({ handle: nextHandler, setNext: vi.fn() } as RequestHandler);

      await handler.handle(mockContext);

      // Should call next handler
      expect(nextHandler).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('FilteringHandler', () => {
    it('should stop chain when URL does not match filter', async () => {
      vi.mocked(mockStateManager.getSettings).mockResolvedValue({
        simpleFilters: ['.mp4'],
        regexFilters: [],
        resourceTypes: [],
        allowList: [],
        denyList: [],
        hlsMpdMode: 'all',
      } as Settings);

      const handler = new FilteringHandler(mockStateManager);
      const nextHandler = vi.fn();
      handler.setNext({ handle: nextHandler, setNext: vi.fn() } as RequestHandler);

      // Request URL is .m3u8, filter is .mp4
      await handler.handle(mockContext);

      // Should NOT call next handler
      expect(nextHandler).not.toHaveBeenCalled();
    });

    it('should continue chain when URL matches filter', async () => {
      vi.mocked(mockStateManager.getSettings).mockResolvedValue({
        simpleFilters: ['.m3u8'],
        regexFilters: [],
        resourceTypes: [],
        allowList: [],
        denyList: [],
        hlsMpdMode: 'all',
      } as Settings);

      const handler = new FilteringHandler(mockStateManager);
      const nextHandler = vi.fn();
      handler.setNext({ handle: nextHandler, setNext: vi.fn() } as RequestHandler);

      await handler.handle(mockContext);

      // Should call next handler
      expect(nextHandler).toHaveBeenCalledWith(mockContext);
    });

    it('should stop chain when type does not match filter', async () => {
      vi.mocked(mockStateManager.getSettings).mockResolvedValue({
        simpleFilters: [],
        regexFilters: [],
        resourceTypes: ['xmlhttprequest'],
        allowList: [],
        denyList: [],
        hlsMpdMode: 'all',
      } as Settings);

      const handler = new FilteringHandler(mockStateManager);
      const nextHandler = vi.fn();
      handler.setNext({ handle: nextHandler, setNext: vi.fn() } as RequestHandler);

      // Request type is 'media', filter is ['xmlhttprequest']
      await handler.handle(mockContext);

      // Should NOT call next handler
      expect(nextHandler).not.toHaveBeenCalled();
    });

    it('should continue chain when type matches filter', async () => {
      vi.mocked(mockStateManager.getSettings).mockResolvedValue({
        simpleFilters: [],
        regexFilters: [],
        resourceTypes: ['media'],
        allowList: [],
        denyList: [],
        hlsMpdMode: 'all',
      } as Settings);

      const handler = new FilteringHandler(mockStateManager);
      const nextHandler = vi.fn();
      handler.setNext({ handle: nextHandler, setNext: vi.fn() } as RequestHandler);

      await handler.handle(mockContext);

      // Should call next handler
      expect(nextHandler).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('LoggingHandler', () => {
    it('should log the request', async () => {
      const handler = new LoggingHandler(mockLogger);

      await handler.handle(mockContext);

      // Should call logger
      expect(mockLogger.logRequest).toHaveBeenCalledWith(
        mockContext.details,
        mockContext.headers,
        mockContext.pageMetadata
      );
    });

    it('should not call next handler (end of chain)', async () => {
      const handler = new LoggingHandler(mockLogger);
      const nextHandler = vi.fn();
      handler.setNext({ handle: nextHandler, setNext: vi.fn() } as RequestHandler);

      await handler.handle(mockContext);

      // LoggingHandler is the end of chain, should not call next
      expect(nextHandler).not.toHaveBeenCalled();
    });

    it('should handle logging errors gracefully', async () => {
      vi.mocked(mockLogger.logRequest).mockRejectedValue(new Error('Logging failed'));

      const handler = new LoggingHandler(mockLogger);

      // Should not throw
      await expect(handler.handle(mockContext)).resolves.toBeUndefined();
    });
  });

  describe('RequestHandlerChain', () => {
    it('should create chain with all handlers', () => {
      const chain = new RequestHandlerChain(mockStateManager, mockLogger);
      expect(chain).toBeDefined();
    });

    it('should process request through full chain when all checks pass', async () => {
      vi.mocked(mockStateManager.getLogData).mockResolvedValue({
        isMonitoring: true,
        monitoringScope: 'activeTab',
        entries: [],
        activeTabId: 1,
      } as LogData);

      vi.mocked(mockStateManager.getSettings).mockResolvedValue({
        simpleFilters: ['.m3u8'],
        regexFilters: [],
        resourceTypes: [],
        allowList: [],
        denyList: [],
        hlsMpdMode: 'all',
      } as Settings);

      const chain = new RequestHandlerChain(mockStateManager, mockLogger);
      await chain.handle(mockContext);

      // Should reach logging handler
      expect(mockLogger.logRequest).toHaveBeenCalledWith(
        mockContext.details,
        mockContext.headers,
        mockContext.pageMetadata
      );
    });

    it('should stop at monitoring check when disabled', async () => {
      vi.mocked(mockStateManager.getLogData).mockResolvedValue({
        isMonitoring: false,
        monitoringScope: 'activeTab',
        entries: [],
        activeTabId: 1,
      } as LogData);

      const chain = new RequestHandlerChain(mockStateManager, mockLogger);
      await chain.handle(mockContext);

      // Should NOT reach logging handler
      expect(mockLogger.logRequest).not.toHaveBeenCalled();
      expect(mockStateManager.getSettings).not.toHaveBeenCalled();
    });

    it('should stop at filtering when URL does not match', async () => {
      vi.mocked(mockStateManager.getLogData).mockResolvedValue({
        isMonitoring: true,
        monitoringScope: 'activeTab',
        entries: [],
        activeTabId: 1,
      } as LogData);

      vi.mocked(mockStateManager.getSettings).mockResolvedValue({
        simpleFilters: ['.mp4'],
        regexFilters: [],
        resourceTypes: [],
        allowList: [],
        denyList: [],
        hlsMpdMode: 'all',
      } as Settings);

      const chain = new RequestHandlerChain(mockStateManager, mockLogger);
      await chain.handle(mockContext);

      // Should NOT reach logging handler
      expect(mockLogger.logRequest).not.toHaveBeenCalled();
    });

    it('should handle errors in chain gracefully', async () => {
      vi.mocked(mockStateManager.getLogData).mockRejectedValue(new Error('State error'));

      const chain = new RequestHandlerChain(mockStateManager, mockLogger);

      // Should not throw
      await expect(chain.handle(mockContext)).resolves.toBeUndefined();
    });
  });

  describe('Chain order', () => {
    it('should execute handlers in correct order', async () => {
      const executionOrder: string[] = [];

      vi.mocked(mockStateManager.getLogData).mockImplementation(async () => {
        executionOrder.push('monitoring-check');
        return {
          isMonitoring: true,
          monitoringScope: 'activeTab',
          entries: [],
          activeTabId: 1,
        } as LogData;
      });

      vi.mocked(mockStateManager.getSettings).mockImplementation(async () => {
        executionOrder.push('filtering');
        return {
          simpleFilters: ['.m3u8'],
          regexFilters: [],
          resourceTypes: [],
          allowList: [],
          denyList: [],
          hlsMpdMode: 'all',
        } as Settings;
      });

      vi.mocked(mockLogger.logRequest).mockImplementation(async () => {
        executionOrder.push('logging');
      });

      const chain = new RequestHandlerChain(mockStateManager, mockLogger);
      await chain.handle(mockContext);

      expect(executionOrder).toEqual(['monitoring-check', 'filtering', 'logging']);
    });
  });

  describe('Performance', () => {
    it('should handle many requests efficiently', async () => {
      vi.mocked(mockStateManager.getLogData).mockResolvedValue({
        isMonitoring: true,
        monitoringScope: 'allTabs',
        entries: [],
        activeTabId: 1,
      } as LogData);

      vi.mocked(mockStateManager.getSettings).mockResolvedValue({
        simpleFilters: [],
        regexFilters: [],
        resourceTypes: [],
        allowList: [],
        denyList: [],
        hlsMpdMode: 'all',
      } as Settings);

      const chain = new RequestHandlerChain(mockStateManager, mockLogger);

      const start = performance.now();

      // Process 100 requests
      const promises = Array.from({ length: 100 }, () => chain.handle(mockContext));
      await Promise.all(promises);

      const duration = performance.now() - start;

      // Should complete in less than 1 second for 100 requests
      expect(duration).toBeLessThan(1000);
      expect(mockLogger.logRequest).toHaveBeenCalledTimes(100);
    });
  });
});

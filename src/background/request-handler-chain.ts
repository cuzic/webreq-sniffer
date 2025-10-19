/**
 * Chain of Responsibility Pattern for Request Processing
 * Implements flexible request handling pipeline
 *
 * Benefits:
 * - Single Responsibility: Each handler has one reason to change
 * - Open/Closed Principle: Easy to add new handlers without modifying existing ones
 * - Loose coupling: Handlers don't know about each other
 * - Easy to reorder or reconfigure the chain
 *
 * Usage:
 * ```typescript
 * const chain = new RequestHandlerChain(stateManager, logger);
 * await chain.handle(context);
 * ```
 */

import type { StateManager } from './state-manager';
import type { RequestLogger } from './request-logger';
import type { PageMetadata } from '@/types';
import { shouldLogRequest } from './filtering';
import { Logger } from '@/lib/logger';

/**
 * Request context passed through the chain
 */
export interface RequestContext {
  details: chrome.webRequest.WebRequestDetails;
  headers?: chrome.webRequest.HttpHeader[];
  pageMetadata?: PageMetadata;
}

/**
 * Base interface for request handlers
 */
export interface RequestHandler {
  /**
   * Set the next handler in the chain
   * @param handler - Next handler to call
   * @returns The handler that was set (for method chaining)
   */
  setNext(handler: RequestHandler): RequestHandler;

  /**
   * Handle the request
   * @param context - Request context
   */
  handle(context: RequestContext): Promise<void>;
}

/**
 * Abstract base handler that implements setNext logic
 */
abstract class BaseHandler implements RequestHandler {
  protected nextHandler: RequestHandler | null = null;

  setNext(handler: RequestHandler): RequestHandler {
    this.nextHandler = handler;
    return handler;
  }

  abstract handle(context: RequestContext): Promise<void>;

  /**
   * Helper to call next handler if it exists
   */
  protected async callNext(context: RequestContext): Promise<void> {
    if (this.nextHandler) {
      await this.nextHandler.handle(context);
    }
  }
}

/**
 * Handler that checks if monitoring is enabled and matches scope
 */
export class MonitoringCheckHandler extends BaseHandler {
  constructor(private stateManager: StateManager) {
    super();
  }

  async handle(context: RequestContext): Promise<void> {
    try {
      const logData = await this.stateManager.getLogData();

      // Check if monitoring is enabled
      if (!logData.isMonitoring) {
        return; // Stop chain
      }

      // Check tab scope
      if (logData.monitoringScope === 'activeTab') {
        if (context.details.tabId !== logData.activeTabId) {
          return; // Stop chain
        }
      }

      // Pass to next handler
      await this.callNext(context);
    } catch (error) {
      Logger.error('monitoring-check-handler', error, {
        url: context.details.url,
        tabId: context.details.tabId,
      });
      // Don't call next on error
    }
  }
}

/**
 * Handler that applies URL and type filtering
 */
export class FilteringHandler extends BaseHandler {
  constructor(private stateManager: StateManager) {
    super();
  }

  async handle(context: RequestContext): Promise<void> {
    try {
      const settings = await this.stateManager.getSettings();

      // Apply filtering logic
      if (!shouldLogRequest(context.details.url, context.details.type, settings)) {
        return; // Stop chain
      }

      // Pass to next handler
      await this.callNext(context);
    } catch (error) {
      Logger.error('filtering-handler', error, {
        url: context.details.url,
        type: context.details.type,
      });
      // Don't call next on error
    }
  }
}

/**
 * Handler that logs the request
 * This is typically the last handler in the chain
 */
export class LoggingHandler extends BaseHandler {
  constructor(private logger: RequestLogger) {
    super();
  }

  async handle(context: RequestContext): Promise<void> {
    try {
      await this.logger.logRequest(context.details, context.headers, context.pageMetadata);

      // LoggingHandler is typically the end of the chain
      // We could call next if we want to add post-logging handlers
      // await this.callNext(context);
    } catch (error) {
      Logger.error('logging-handler', error, {
        url: context.details.url,
        requestId: context.details.requestId,
      });
      // Don't call next on error
    }
  }
}

/**
 * Main request handler chain
 * Configures and manages the chain of handlers
 */
export class RequestHandlerChain {
  private firstHandler: RequestHandler;

  constructor(stateManager: StateManager, logger: RequestLogger) {
    // Build the chain
    const monitoringCheck = new MonitoringCheckHandler(stateManager);
    const filtering = new FilteringHandler(stateManager);
    const logging = new LoggingHandler(logger);

    // Chain them together
    monitoringCheck.setNext(filtering).setNext(logging);

    // Store reference to first handler
    this.firstHandler = monitoringCheck;
  }

  /**
   * Process request through the chain
   * @param context - Request context
   */
  async handle(context: RequestContext): Promise<void> {
    try {
      await this.firstHandler.handle(context);
    } catch (error) {
      Logger.error('request-handler-chain', error, {
        url: context.details.url,
        type: context.details.type,
      });
    }
  }
}

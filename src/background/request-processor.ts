/**
 * RequestProcessor Class
 * Coordinates request processing using Chain of Responsibility pattern
 */

import type { StateManager } from './state-manager';
import type { RequestLogger } from './request-logger';
import type { PageMetadata } from '@/types';
import { RequestHandlerChain } from './request-handler-chain';

/**
 * RequestProcessor coordinates the request handling workflow
 * Uses Chain of Responsibility pattern for flexible processing
 */
export class RequestProcessor {
  private chain: RequestHandlerChain;

  constructor(stateManager: StateManager, logger: RequestLogger) {
    // Initialize the handler chain
    this.chain = new RequestHandlerChain(stateManager, logger);
  }

  /**
   * Process a web request through the chain of handlers
   * @param details Web request details
   * @param headers Optional request headers
   * @param pageMetadata Optional page metadata from content script
   */
  async processRequest(
    details: chrome.webRequest.WebRequestDetails,
    headers?: chrome.webRequest.HttpHeader[],
    pageMetadata?: PageMetadata
  ): Promise<void> {
    // Create request context and pass through chain
    await this.chain.handle({
      details,
      headers,
      pageMetadata,
    });
  }
}

/**
 * LogEntry Builder Pattern
 * Provides fluent API for constructing LogEntry objects
 *
 * Benefits:
 * - Fluent interface for readable code
 * - Separates construction logic from representation
 * - Easy to add new optional fields
 * - Validates required fields before building
 * - Reusable builder instances
 *
 * Usage:
 * ```typescript
 * const entry = new LogEntryBuilder()
 *   .fromWebRequest(details)
 *   .withHeaders(headers)
 *   .withPageMetadata(metadata)
 *   .build();
 * ```
 */

import type { LogEntry, PageMetadata } from '@/types';

/**
 * LogEntry Builder
 * Implements Builder pattern for flexible LogEntry construction
 */
export class LogEntryBuilder {
  private details?: chrome.webRequest.WebRequestDetails;
  private headers?: chrome.webRequest.HttpHeader[];
  private pageMetadata?: PageMetadata;

  /**
   * Set web request details (required)
   * @param details - Web request details from chrome.webRequest API
   * @returns This builder instance for chaining
   */
  fromWebRequest(details: chrome.webRequest.WebRequestDetails): this {
    this.details = details;
    return this;
  }

  /**
   * Add request headers (optional)
   * @param headers - Request headers from chrome.webRequest API
   * @returns This builder instance for chaining
   */
  withHeaders(headers: chrome.webRequest.HttpHeader[]): this {
    this.headers = headers;
    return this;
  }

  /**
   * Add page metadata (optional)
   * @param metadata - Page metadata from content script
   * @returns This builder instance for chaining
   */
  withPageMetadata(metadata: PageMetadata): this {
    this.pageMetadata = metadata;
    return this;
  }

  /**
   * Build the LogEntry object
   * @returns Complete LogEntry
   * @throws Error if required fields are missing
   */
  build(): LogEntry {
    // Validate required fields
    if (!this.details) {
      throw new Error('Web request details are required');
    }

    // Validate web request has required fields
    if (
      !this.details.requestId ||
      !this.details.url ||
      !this.details.method ||
      !this.details.type
    ) {
      throw new Error('Web request details are missing required fields');
    }

    // Process headers into map
    const headerMap = this.processHeaders();

    // Generate dedupe key
    const dedupeKey = this.generateDedupeKey(this.details.url, headerMap);

    // Build the entry
    const entry: LogEntry = {
      id: this.generateId(),
      requestId: this.details.requestId,
      url: this.details.url,
      method: this.details.method,
      type: this.details.type,
      tabId: this.details.tabId,
      frameId: this.details.frameId,
      timestamp: this.details.timeStamp,
      initiator: this.details.initiator,
      headers: Object.keys(headerMap).length > 0 ? headerMap : undefined,
      dedupeKey,
      pageMetadata: this.pageMetadata,
    };

    return entry;
  }

  /**
   * Reset builder state for reuse
   * @returns This builder instance
   */
  reset(): this {
    this.details = undefined;
    this.headers = undefined;
    this.pageMetadata = undefined;
    return this;
  }

  /**
   * Generate unique ID for log entry
   * @private
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Process headers array into key-value map
   * @private
   */
  private processHeaders(): Record<string, string> {
    const headerMap: Record<string, string> = {};

    if (this.headers) {
      for (const header of this.headers) {
        if (header.name && header.value) {
          headerMap[header.name] = header.value;
        }
      }
    }

    return headerMap;
  }

  /**
   * Generate dedupe key from URL and headers
   * @private
   */
  private generateDedupeKey(url: string, headers: Record<string, string>): string {
    // Simple hash based on URL and key headers
    const referer = headers['Referer'] || '';
    const origin = headers['Origin'] || '';
    const combined = `${url}|${referer}|${origin}`;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return hash.toString(36);
  }

  /**
   * Static factory method: Create builder from web request
   * @param details - Web request details
   * @param headers - Optional request headers
   * @param pageMetadata - Optional page metadata
   * @returns New builder instance
   */
  static fromRequest(
    details: chrome.webRequest.WebRequestDetails,
    headers?: chrome.webRequest.HttpHeader[],
    pageMetadata?: PageMetadata
  ): LogEntryBuilder {
    const builder = new LogEntryBuilder().fromWebRequest(details);

    if (headers) {
      builder.withHeaders(headers);
    }

    if (pageMetadata) {
      builder.withPageMetadata(pageMetadata);
    }

    return builder;
  }
}

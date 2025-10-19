/**
 * Logging Module
 * Handles log entry creation and deduplication using Builder pattern
 */

import type { LogEntry, PageMetadata } from '@/types';
import { LogEntryBuilder } from './log-entry-builder';

/**
 * Generate dedupe key from URL and headers
 * @deprecated Use LogEntryBuilder instead
 */
export function generateDedupeKey(url: string, headers?: Record<string, string>): string {
  // Simple hash based on URL and key headers
  const referer = headers?.['Referer'] || '';
  const origin = headers?.['Origin'] || '';
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
 * Check if entry already exists (by dedupeKey)
 */
export function isDuplicate(dedupeKey: string, entries: LogEntry[]): boolean {
  return entries.some((entry) => entry.dedupeKey === dedupeKey);
}

/**
 * Create a log entry from webRequest details
 * Uses Builder pattern for flexible construction
 */
export function createLogEntry(
  details: chrome.webRequest.WebRequestDetails,
  headers?: chrome.webRequest.HttpHeader[],
  pageMetadata?: PageMetadata
): LogEntry {
  return LogEntryBuilder.fromRequest(details, headers, pageMetadata).build();
}

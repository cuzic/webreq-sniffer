/**
 * Logging Module
 * Handles log entry creation and deduplication using Builder pattern
 *
 * Note: Prefer using LogEntryBuilder directly for more flexibility:
 * - LogEntryBuilder.fromRequest(details, headers, metadata).build()
 */

import type { LogEntry, PageMetadata } from '@/types';
import { LogEntryBuilder } from './log-entry-builder';

/**
 * Check if entry already exists (by dedupeKey)
 */
export function isDuplicate(dedupeKey: string, entries: LogEntry[]): boolean {
  return entries.some((entry) => entry.dedupeKey === dedupeKey);
}

/**
 * Create a log entry from webRequest details
 * Convenience wrapper around LogEntryBuilder
 *
 * For more control, use LogEntryBuilder directly:
 * @example
 * LogEntryBuilder.fromRequest(details, headers, metadata).build()
 */
export function createLogEntry(
  details: chrome.webRequest.WebRequestDetails,
  headers?: chrome.webRequest.HttpHeader[],
  pageMetadata?: PageMetadata
): LogEntry {
  return LogEntryBuilder.fromRequest(details, headers, pageMetadata).build();
}

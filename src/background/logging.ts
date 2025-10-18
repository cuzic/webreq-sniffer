/**
 * Logging Module
 * Handles log entry creation and storage
 */

import type { LogEntry, Settings, PageMetadata } from '@/types';
import { getLogData, setLogData } from './storage';

/**
 * Generate a unique ID for log entry
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate dedupe key from URL and headers
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
 */
export function createLogEntry(
  details: chrome.webRequest.WebRequestDetails,
  headers?: chrome.webRequest.HttpHeader[],
  pageMetadata?: PageMetadata
): LogEntry {
  const headerMap: Record<string, string> = {};

  if (headers) {
    for (const header of headers) {
      if (header.name && header.value) {
        headerMap[header.name] = header.value;
      }
    }
  }

  const dedupeKey = generateDedupeKey(details.url, headerMap);

  return {
    id: generateId(),
    requestId: details.requestId,
    url: details.url,
    method: details.method,
    type: details.type,
    tabId: details.tabId,
    frameId: details.frameId,
    timestamp: details.timeStamp,
    initiator: details.initiator,
    headers: Object.keys(headerMap).length > 0 ? headerMap : undefined,
    dedupeKey,
    pageMetadata,
  };
}

/**
 * Add entry to log data with ring buffer management
 */
export async function addLogEntry(entry: LogEntry, settings: Settings): Promise<void> {
  const logData = await getLogData();

  // Check for duplicates
  if (isDuplicate(entry.dedupeKey, logData.entries)) {
    console.log('Duplicate entry skipped:', entry.url);
    return;
  }

  // Add new entry
  logData.entries.push(entry);

  // Ring buffer: remove oldest if over limit
  const maxEntries = settings.limits.maxEntries;
  if (logData.entries.length > maxEntries) {
    const removeCount = logData.entries.length - maxEntries;
    logData.entries.splice(0, removeCount);
    console.log(`Ring buffer: removed ${removeCount} oldest entries`);
  }

  await setLogData(logData);
}

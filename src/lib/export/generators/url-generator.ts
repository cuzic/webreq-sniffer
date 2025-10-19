/**
 * URL Generator
 * Generates plain text URL lists
 */

import type { LogEntry } from '@/types';

/**
 * Generate plain URL list
 *
 * @param entries - Log entries to export
 * @returns Plain text list of URLs, one per line
 *
 * @example
 * generateUrlList(entries)
 * // Returns:
 * // https://example.com/video.m3u8
 * // https://example.com/segment.ts
 */
export function generateUrlList(entries: LogEntry[]): string {
  return entries.map((entry) => entry.url).join('\n') + '\n';
}

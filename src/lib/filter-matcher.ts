/**
 * Filter Matcher
 * Utilities for matching log entries against filter criteria
 */

import type { LogEntry } from '@/types';

/**
 * Filter criteria for matching entries
 */
export interface FilterCriteria {
  searchTerm: string;
  filterType: string;
}

/**
 * Check if a single entry matches the given filter criteria
 *
 * @param entry - Log entry to check
 * @param criteria - Filter criteria (searchTerm and filterType)
 * @returns true if entry matches all criteria, false otherwise
 *
 * @example
 * ```typescript
 * const entry = { url: 'https://example.com/video.mp4', type: 'media', ... };
 * matchesFilter(entry, { searchTerm: 'video', filterType: 'media' }); // true
 * matchesFilter(entry, { searchTerm: 'image', filterType: 'media' }); // false
 * ```
 */
export function matchesFilter(entry: LogEntry, criteria: FilterCriteria): boolean {
  const { searchTerm, filterType } = criteria;

  // Search term filter (case-insensitive)
  if (searchTerm && !entry.url.toLowerCase().includes(searchTerm.toLowerCase())) {
    return false;
  }

  // Resource type filter
  if (filterType !== 'all' && entry.type !== filterType) {
    return false;
  }

  return true;
}

/**
 * Count how many entries match the given filter criteria
 *
 * @param entries - Array of log entries to filter
 * @param criteria - Filter criteria (searchTerm and filterType)
 * @returns Number of entries that match the criteria
 *
 * @example
 * ```typescript
 * const entries = [...]; // array of log entries
 * const count = countMatchingEntries(entries, { searchTerm: 'video', filterType: 'media' });
 * console.log(`${count} entries match the filter`);
 * ```
 */
export function countMatchingEntries(entries: LogEntry[], criteria: FilterCriteria): number {
  return entries.filter((entry) => matchesFilter(entry, criteria)).length;
}

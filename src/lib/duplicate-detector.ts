/**
 * Duplicate Detector
 * Utilities for detecting and removing duplicate requests
 */

import type { LogEntry } from '@/types';

/**
 * Strategy for handling duplicates
 */
export enum DuplicateStrategy {
  /**
   * Keep the first occurrence of each duplicate group
   */
  KEEP_FIRST = 'keep_first',

  /**
   * Keep the last occurrence of each duplicate group
   */
  KEEP_LAST = 'keep_last',
}

/**
 * Information about a duplicate entry
 */
export interface DuplicateInfo {
  /**
   * Unique identifier for the duplicate group
   */
  groupId: string;

  /**
   * Total number of entries in this duplicate group
   */
  count: number;

  /**
   * Whether this is the first entry in the group
   */
  isFirst: boolean;

  /**
   * Whether this is the last entry in the group
   */
  isLast: boolean;
}

/**
 * Map of entry IDs to their duplicate information
 */
export type DuplicateMap = Record<string, DuplicateInfo>;

/**
 * Generate a unique key for grouping duplicate entries
 * Duplicates are identified by URL and method
 */
function getDuplicateKey(entry: LogEntry): string {
  return `${entry.method}:${entry.url}`;
}

/**
 * Group log entries by their duplicate key
 *
 * @param entries - Array of log entries
 * @returns Map of duplicate keys to arrays of entries
 */
export function groupDuplicates(entries: LogEntry[]): Map<string, LogEntry[]> {
  const groups = new Map<string, LogEntry[]>();

  for (const entry of entries) {
    const key = getDuplicateKey(entry);
    const group = groups.get(key) || [];
    group.push(entry);
    groups.set(key, group);
  }

  return groups;
}

/**
 * Detect duplicate entries in a list of log entries
 *
 * @param entries - Array of log entries to analyze
 * @returns Map of entry IDs to duplicate information
 *
 * @example
 * ```typescript
 * const entries = [...]; // array of log entries
 * const duplicates = detectDuplicates(entries);
 *
 * // Check if an entry is a duplicate
 * if (duplicates[entry.id]) {
 *   console.log(`Entry ${entry.id} is duplicate #${duplicates[entry.id].count}`);
 * }
 * ```
 */
export function detectDuplicates(entries: LogEntry[]): DuplicateMap {
  const groups = groupDuplicates(entries);
  const duplicateMap: DuplicateMap = {};

  // Process each group
  for (const [key, group] of groups.entries()) {
    // Only mark as duplicates if there are multiple entries
    if (group.length > 1) {
      group.forEach((entry, index) => {
        duplicateMap[entry.id] = {
          groupId: key,
          count: group.length,
          isFirst: index === 0,
          isLast: index === group.length - 1,
        };
      });
    }
  }

  return duplicateMap;
}

/**
 * Count the total number of duplicate entries
 *
 * @param entries - Array of log entries
 * @returns Number of entries that are duplicates
 *
 * @example
 * ```typescript
 * const entries = [...]; // array of log entries
 * const count = countDuplicates(entries);
 * console.log(`Found ${count} duplicate entries`);
 * ```
 */
export function countDuplicates(entries: LogEntry[]): number {
  const duplicates = detectDuplicates(entries);
  return Object.keys(duplicates).length;
}

/**
 * Remove duplicate entries from a list based on the specified strategy
 *
 * @param entries - Array of log entries
 * @param strategy - Strategy for keeping entries (KEEP_FIRST or KEEP_LAST)
 * @returns New array with duplicates removed
 *
 * @example
 * ```typescript
 * const entries = [...]; // array with duplicates
 * const unique = removeDuplicates(entries, DuplicateStrategy.KEEP_FIRST);
 * console.log(`Removed ${entries.length - unique.length} duplicates`);
 * ```
 */
export function removeDuplicates(entries: LogEntry[], strategy: DuplicateStrategy): LogEntry[] {
  const groups = groupDuplicates(entries);
  const result: LogEntry[] = [];

  for (const group of groups.values()) {
    if (group.length === 1) {
      // No duplicates, keep the entry
      result.push(group[0]);
    } else {
      // Duplicates exist, apply strategy
      if (strategy === DuplicateStrategy.KEEP_FIRST) {
        result.push(group[0]);
      } else if (strategy === DuplicateStrategy.KEEP_LAST) {
        result.push(group[group.length - 1]);
      }
    }
  }

  return result;
}

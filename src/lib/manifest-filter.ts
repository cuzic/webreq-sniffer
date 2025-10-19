/**
 * Manifest Filter
 * Smart filtering of master vs media playlists
 */

import type { LogEntry } from '@/types';
import { detectManifestType } from './manifest-parser';

/**
 * Extract base URL (domain + path without filename)
 * Used for grouping related manifests
 */
function getBaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    pathParts.pop(); // Remove filename
    return `${urlObj.origin}${pathParts.join('/')}`;
  } catch {
    return url;
  }
}

/**
 * Detect if a manifest URL is likely a master/parent playlist
 * Based on URL patterns (heuristic approach)
 */
function isMasterByUrl(url: string): boolean {
  const filename = url.split('/').pop()?.toLowerCase() || '';

  // Common master playlist names
  const masterPatterns = ['master', 'index', 'playlist', 'manifest', 'main'];

  // Check if filename contains master pattern
  for (const pattern of masterPatterns) {
    if (filename.includes(pattern)) {
      return true;
    }
  }

  // Media playlist patterns (resolution-based names)
  // If it matches these, it's NOT a master
  const mediaPatterns = [
    /^\d+p\.m3u8$/i, // 720p.m3u8, 1080p.m3u8
    /^\d+x\d+\.m3u8$/i, // 1280x720.m3u8
    /^(low|medium|high|audio|video)\.m3u8$/i, // quality names
  ];

  for (const pattern of mediaPatterns) {
    if (pattern.test(filename)) {
      return false;
    }
  }

  // Default: assume master if we can't determine
  // (safer to keep than remove)
  return true;
}

/**
 * Filter manifest entries intelligently:
 * - If a group has master playlists, keep only masters and remove media playlists
 * - If a group has no master playlists, keep all media playlists
 * - Preserve all non-manifest entries
 *
 * @param entries - Array of log entries
 * @returns Filtered array with smart master/media selection
 */
export function filterManifestEntries(entries: LogEntry[]): LogEntry[] {
  // Group entries by base URL
  const groups = new Map<string, LogEntry[]>();

  for (const entry of entries) {
    const manifestType = detectManifestType(entry.url);

    // Only group manifest files
    if (manifestType) {
      const baseUrl = getBaseUrl(entry.url);
      const group = groups.get(baseUrl) || [];
      group.push(entry);
      groups.set(baseUrl, group);
    }
  }

  // Process each group
  const result: LogEntry[] = [];
  const processedIds = new Set<string>();

  for (const groupEntries of groups.values()) {
    // Find master playlists in this group
    const masters = groupEntries.filter((entry) => isMasterByUrl(entry.url));

    if (masters.length > 0) {
      // Has master(s): keep only masters, discard media
      result.push(...masters);
      // Mark ALL group entries as processed (including filtered-out media playlists)
      groupEntries.forEach((e) => processedIds.add(e.id));
    } else {
      // No master: keep all media playlists
      result.push(...groupEntries);
      groupEntries.forEach((e) => processedIds.add(e.id));
    }
  }

  // Add all non-manifest entries (not in any group)
  for (const entry of entries) {
    if (!processedIds.has(entry.id)) {
      result.push(entry);
    }
  }

  return result;
}

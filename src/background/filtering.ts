/**
 * Filtering Logic Module
 * Implements request filtering based on settings
 */

import type { Settings } from '@/types';

/**
 * Check if URL matches deny list patterns
 */
export function matchesDenyList(url: string, denyList: string[]): boolean {
  return denyList.some((pattern) => {
    try {
      // Support wildcards like *.example.com
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(url);
    } catch {
      // If pattern is invalid regex, do simple string match
      return url.includes(pattern);
    }
  });
}

/**
 * Check if URL matches allow list patterns
 */
export function matchesAllowList(url: string, allowList: string[]): boolean {
  if (allowList.length === 0) {
    return true; // No allow list means everything is allowed
  }

  return allowList.some((pattern) => {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(url);
    } catch {
      return url.includes(pattern);
    }
  });
}

/**
 * Check if resource type is in the filter list
 */
export function matchesResourceType(type: string, resourceTypes: string[]): boolean {
  if (resourceTypes.length === 0) {
    return true; // No filter means all types allowed
  }
  return resourceTypes.includes(type);
}

/**
 * Check if URL is a HLS/MPD segment (should be excluded in playlistOnly mode)
 */
export function isMediaSegment(url: string): boolean {
  // Common HLS/DASH segment patterns
  const segmentPatterns = [
    /\.ts$/i, // HLS segments
    /\.m4s$/i, // DASH segments
    /segment\d+/i, // Generic segment pattern
    /-\d+\.m4s$/i, // Numbered DASH segments
    /chunk-\d+/i, // Chunk pattern
  ];

  return segmentPatterns.some((pattern) => pattern.test(url));
}

/**
 * Check if URL is a playlist/manifest (should be kept even in playlistOnly mode)
 */
export function isPlaylistOrManifest(url: string): boolean {
  const playlistPatterns = [
    /\.m3u8$/i, // HLS playlist
    /\.mpd$/i, // DASH manifest
    /master\.m3u8/i, // HLS master playlist
    /index\.m3u8/i, // HLS index
    /playlist/i, // Generic playlist
    /manifest/i, // Generic manifest
  ];

  return playlistPatterns.some((pattern) => pattern.test(url));
}

/**
 * Check if URL matches simple filter patterns
 */
export function matchesSimpleFilters(url: string, simpleFilters: string[]): boolean {
  if (simpleFilters.length === 0) {
    return false; // No filters means nothing matches
  }

  return simpleFilters.some((filter) => url.includes(filter));
}

/**
 * Check if URL matches regex filter patterns
 */
export function matchesRegexFilters(url: string, regexFilters: string[]): boolean {
  if (regexFilters.length === 0) {
    return false;
  }

  return regexFilters.some((pattern) => {
    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(url);
    } catch {
      console.warn(`Invalid regex pattern: ${pattern}`);
      return false;
    }
  });
}

/**
 * Main filtering function
 * Returns true if the request should be logged
 */
export function shouldLogRequest(url: string, resourceType: string, settings: Settings): boolean {
  // Step 1: Check deny list
  if (matchesDenyList(url, settings.denyList)) {
    return false;
  }

  // Step 2: Check allow list
  if (!matchesAllowList(url, settings.allowList)) {
    return false;
  }

  // Step 3: Check resource type
  if (!matchesResourceType(resourceType, settings.resourceTypes)) {
    return false;
  }

  // Step 4: HLS/MPD mode check
  if (settings.hlsMpdMode === 'playlistOnly') {
    if (isMediaSegment(url) && !isPlaylistOrManifest(url)) {
      return false; // Exclude segments in playlistOnly mode
    }
  }

  // Step 5: Check filters (regex or simple)
  const matchesFilter =
    matchesRegexFilters(url, settings.regexFilters) ||
    matchesSimpleFilters(url, settings.simpleFilters);

  // If filters are defined, URL must match at least one
  // If no filters are defined, allow all (that passed previous checks)
  if (settings.regexFilters.length === 0 && settings.simpleFilters.length === 0) {
    return true;
  }

  return matchesFilter;
}

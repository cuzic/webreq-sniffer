/**
 * Application Constants
 * Centralized configuration for magic numbers and strings
 */

/**
 * Storage and caching configuration
 */
export const STORAGE = {
  /** Cache TTL in milliseconds (5 seconds) */
  CACHE_TTL: 5000,
  /** Minimum allowed entries */
  MAX_ENTRIES_MIN: 1,
  /** Maximum allowed entries */
  MAX_ENTRIES_MAX: 10000,
  /** Default maximum entries in ring buffer */
  DEFAULT_MAX_ENTRIES: 3000,
} as const;

/**
 * Monitoring badge configuration
 */
export const MONITORING = {
  /** Badge text when monitoring is active */
  BADGE_TEXT: 'REC',
  /** Badge background color (red) */
  BADGE_COLOR: '#FF0000',
} as const;

/**
 * Export configuration
 */
export const EXPORT = {
  /** Default filename template with placeholders */
  DEFAULT_FILENAME_TEMPLATE: 'netlog_{date}_{domain}.{ext}',
  /** Default domain name when URL parsing fails */
  DEFAULT_DOMAIN: 'logs',
  /** File extensions for each export format */
  EXTENSIONS: {
    'url-list': 'txt',
    'bash-curl': 'sh',
    'bash-curl-headers': 'sh',
    'bash-yt-dlp': 'sh',
    powershell: 'ps1',
    json: 'json',
  },
} as const;

/**
 * Filtering patterns for HLS/DASH media
 */
export const FILTERING = {
  /** Media segment patterns (HLS/DASH) */
  SEGMENT_PATTERNS: [
    /\.ts$/i, // HLS segments
    /\.m4s$/i, // DASH segments
    /segment\d+/i, // Generic segment pattern
    /-\d+\.m4s$/i, // Numbered DASH segments
    /chunk-\d+/i, // Chunk pattern
  ],
  /** Playlist/manifest patterns */
  PLAYLIST_PATTERNS: [
    /\.m3u8$/i, // HLS playlist
    /\.mpd$/i, // DASH manifest
    /master\.m3u8/i, // HLS master playlist
    /index\.m3u8/i, // HLS index
    /playlist/i, // Generic playlist
    /manifest/i, // Generic manifest
  ],
} as const;

/**
 * UI configuration
 */
export const UI = {
  /** Duration to show success message in milliseconds (3 seconds) */
  TOAST_DURATION: 3000,
} as const;

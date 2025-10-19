/**
 * Application Constants
 *
 * This file centralizes all magic numbers and configuration values
 * used throughout the application for better maintainability.
 */

// ============================================================================
// UI Refresh Intervals (milliseconds)
// ============================================================================

export const REFRESH_INTERVALS = {
  /** Popup status polling interval */
  STATUS_POLLING: 1000,
  /** Log update interval */
  LOG_UPDATE: 500,
} as const;

// ============================================================================
// Export Preview Settings
// ============================================================================

export const EXPORT_PREVIEW = {
  /** Number of entries to show in preview */
  ENTRY_COUNT: 3,
  /** Number of lines to show when collapsed */
  LINE_LIMIT: 15,
} as const;

// ============================================================================
// Monitoring Settings
// ============================================================================

export const MONITORING = {
  /** Badge text displayed when monitoring is active */
  BADGE_TEXT: '●',
} as const;

// ============================================================================
// Badge Display Settings
// ============================================================================

export const BADGE = {
  /** Threshold for 'k' notation (1k, 2k, etc.) */
  THRESHOLD_K: 1000,
  /** Threshold for integer 'k' notation (10k, 11k, etc.) */
  THRESHOLD_10K: 10000,
  /** Badge color when monitoring is active */
  COLOR_MONITORING: '#4CAF50',
  /** Badge color when monitoring is stopped */
  COLOR_STOPPED: '#757575',
} as const;

// ============================================================================
// UI Dimensions
// ============================================================================

export const UI = {
  /** Popup window width in pixels */
  POPUP_WIDTH: 400,
  /** Log list container height in pixels */
  LOG_LIST_HEIGHT: 300,
  /** Details dialog max width */
  DETAILS_DIALOG_WIDTH: '3xl',
  /** Toast notification duration in milliseconds */
  TOAST_DURATION: 2000,
} as const;

// ============================================================================
// Storage Settings
// ============================================================================

export const STORAGE = {
  /** Default maximum number of log entries to store */
  DEFAULT_MAX_ENTRIES: 3000,
  /** Cache TTL in milliseconds (5 seconds) */
  CACHE_TTL: 5000,
} as const;

// ============================================================================
// Export Settings
// ============================================================================

export const EXPORT = {
  /** Default filename template for exports */
  DEFAULT_FILENAME_TEMPLATE: 'netlog_{date}_{domain}.{ext}',
  /** Default domain name when URL parsing fails */
  DEFAULT_DOMAIN: 'unknown',
  /** File extensions for each export format */
  EXTENSIONS: {
    'url-list': 'txt',
    'bash-curl': 'sh',
    'bash-curl-headers': 'sh',
    'bash-yt-dlp': 'sh',
    'bash-yt-dlp-cookies': 'sh',
    'bash-batch-download': 'sh',
    powershell: 'ps1',
    'powershell-batch-download': 'ps1',
    json: 'json',
  } as const,
} as const;

// ============================================================================
// Filtering Patterns
// ============================================================================

export const FILTERING = {
  /** Regex patterns for HLS/DASH media segments (excluded in playlistOnly mode) */
  SEGMENT_PATTERNS: [
    /\.ts$/i, // HLS MPEG-TS segments
    /\.m4s$/i, // DASH segments
    /\.fmp4$/i, // Fragmented MP4
  ] as const,

  /** Regex patterns for playlists/manifests (always captured) */
  PLAYLIST_PATTERNS: [
    /\.m3u8$/i, // HLS playlists
    /\.mpd$/i, // DASH manifests
  ] as const,
} as const;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a valid export format
 */
export function isExportFormat(value: string): boolean {
  const validFormats = [
    'url-list',
    'bash-curl',
    'bash-curl-headers',
    'bash-yt-dlp',
    'bash-yt-dlp-cookies',
    'bash-batch-download',
    'powershell',
    'powershell-batch-download',
    'json',
  ];
  return validFormats.includes(value);
}

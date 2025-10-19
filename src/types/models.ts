/**
 * Data Model Type Definitions
 * Based on docs/requirements.md Section 3
 */

// ========================================
// Settings (storage.sync)
// ========================================

export interface HeaderPolicy {
  basic: boolean; // Collect User-Agent, Referer, Origin
  sensitiveEnabled: boolean; // Collect Cookie, Authorization, etc. (Default: false)
}

export interface Limits {
  maxEntries: number; // e.g., 3000
}

export type Newline = 'LF' | 'CRLF';

export interface ExportSettings {
  filenameTemplate: string; // e.g., "netlog_{date}_{domain}.{ext}"
  newline: Newline;
  customTemplates: ExportTemplate[];
  defaultTemplateId: string;
}

export interface UISettings {
  showBadge: boolean;
}

export type TargetScope = 'activeTab' | 'allTabs';
export type HlsMpdMode = 'playlistOnly' | 'all';

export interface CustomPreset {
  id: string;
  name: string;
  icon?: string; // emoji
  simpleFilters: string[];
  regexFilters: string[];
  resourceTypes: string[];
  allowList: string[];
  denyList: string[];
  hlsMpdMode: HlsMpdMode;
}

export interface Settings {
  targetScope: TargetScope;
  simpleFilters: string[]; // e.g., [".m3u8", ".pdf", "segment"]
  regexFilters: string[]; // e.g., ["/(master|index)\\.m3u8/i"]
  resourceTypes: string[]; // e.g., ["xmlhttprequest", "media", "image"]
  allowList: string[]; // e.g., ["https://*.example.com/*"]
  denyList: string[];
  headerPolicy: HeaderPolicy;
  hlsMpdMode: HlsMpdMode;
  limits: Limits;
  exportSettings: ExportSettings;
  ui: UISettings;
  customPresets: CustomPreset[];
  customSelectors: CustomSelector[]; // CSS selectors for extracting video titles
}

// ========================================
// Log Entry (storage.local)
// ========================================

export interface LogHeaders {
  'User-Agent'?: string;
  Referer?: string;
  Origin?: string;
  // Note: Sensitive headers (Cookie, Authorization) are only held in memory
  // temporarily if enabled, NOT saved to storage
}

/**
 * Stream Variant information (different quality/bitrate options)
 */
export interface StreamVariant {
  resolution?: string; // "1920x1080"
  bandwidth?: number; // bits per second
  codecs?: string; // "avc1.640028,mp4a.40.2"
  frameRate?: number; // 30
  url?: string; // Variant playlist URL (HLS) or Representation ID (DASH)
  label?: string; // Human-readable label (e.g., "1080p", "720p")
}

/**
 * Manifest Metadata extracted from HLS/DASH files
 */
export interface ManifestMetadata {
  type: 'hls' | 'dash'; // Manifest type
  title?: string; // Extracted from #EXT-X-TITLE or MPD @title
  programDateTime?: string; // #EXT-X-PROGRAM-DATE-TIME
  targetDuration?: number; // #EXT-X-TARGETDURATION
  segmentPattern?: string; // Common pattern in segment URLs
  variants?: StreamVariant[]; // Available stream variants (different qualities)
}

/**
 * Page Metadata collected from Content Script
 */
export interface PageMetadata {
  pageTitle: string; // document.title
  ogTitle?: string; // <meta property="og:title">
  ogDescription?: string; // <meta property="og:description">
  metaTitle?: string; // <meta name="title">
  metaDescription?: string; // <meta name="description">
  videoTitle?: string; // Video player-specific title
  manifestMetadata?: ManifestMetadata; // Metadata from HLS/DASH manifest
}

/**
 * Custom CSS Selector for extracting video title from specific sites
 */
export interface CustomSelector {
  id: string; // Unique identifier
  name: string; // Display name (e.g., "YouTube")
  pattern: string; // URL pattern to match (e.g., "youtube.com", "*.vimeo.com/*")
  selector: string; // CSS selector for video title element
  attribute?: string; // Optional: attribute to extract (default: textContent)
  enabled: boolean;
}

export interface LogEntry {
  id: string; // Internal unique ID (e.g., UUID)
  requestId: string; // From webRequest API
  url: string; // Final URL after redirects
  method: string; // "GET", "POST", etc.
  type: string; // ResourceType
  tabId: number;
  frameId: number;
  timestamp: number; // Epoch milliseconds
  initiator?: string; // e.g., "https://example.com"
  headers?: LogHeaders; // Response headers
  requestHeaders?: Record<string, string>; // Request headers (for curl/yt-dlp commands)
  dedupeKey: string; // Hash of (url + key headers) for deduplication
  pageMetadata?: PageMetadata; // Page metadata from content script
}

// ========================================
// Log Data (storage.local)
// ========================================

export type MonitoringScope = 'activeTab' | 'allTabs';

export interface LogData {
  isMonitoring: boolean;
  monitoringScope: MonitoringScope;
  activeTabId?: number;
  entries: LogEntry[]; // Managed as a ring buffer
}

/**
 * Monitoring Status (UI State)
 * Used by the popup to display current monitoring state
 */
export interface MonitoringStatus {
  isMonitoring: boolean;
  monitoringScope: MonitoringScope;
  entryCount: number;
  entries: LogEntry[];
}

// ========================================
// Export Formats
// ========================================

export type ExportFormat =
  | 'url-list' // Plain text list of URLs (.txt)
  | 'bash-curl' // Bash script with curl commands
  | 'bash-curl-headers' // Bash script with curl + headers
  | 'bash-yt-dlp' // Bash script with yt-dlp commands
  | 'bash-yt-dlp-cookies' // Bash script with yt-dlp + cookies
  | 'bash-batch-download' // Bash batch download with quality selection
  | 'powershell' // PowerShell script
  | 'powershell-batch-download' // PowerShell batch download with quality selection
  | 'json'; // JSON format

export interface ExportOptions {
  format: ExportFormat;
  includeHeaders: boolean;
  filename?: string;
}

// ========================================
// Export Templates
// ========================================

export interface ExportTemplate {
  id: string;
  name: string;
  template: string; // Handlebars template
  fileExtension: string; // e.g., ".sh", ".txt", ".json"
  isBuiltIn: boolean;
  description?: string;
}

export interface EnrichedLogEntry extends LogEntry {
  index: number;
  index1: number;
  domain: string;
  path: string;
  query: string;
  protocol: string;
  filename: string;
  fileExtension: string;
}

// ========================================
// Filter Preview
// ========================================

export interface PreviewResult {
  total: number;
  matched: number;
  matchRate: number;
  samples: string[];
}

// ========================================
// Message Types (for chrome.runtime messaging)
// ========================================

export type MessageType =
  | 'start-monitoring'
  | 'stop-monitoring'
  | 'get-status'
  | 'export-logs'
  | 'clear-logs'
  | 'get-settings'
  | 'update-settings';

/**
 * Type-safe discriminated union for messages
 * Each message type has its own payload type
 */
export type Message =
  | {
      type: 'start-monitoring';
      payload: {
        scope: 'activeTab' | 'allTabs';
        activeTabId?: number;
      };
    }
  | { type: 'stop-monitoring'; payload?: never }
  | { type: 'get-status'; payload?: never }
  | { type: 'clear-logs'; payload?: never }
  | { type: 'get-settings'; payload?: never }
  | { type: 'update-settings'; payload: Partial<Settings> }
  | { type: 'export-logs'; payload: { format: ExportFormat; selectedIds?: string[] } };

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

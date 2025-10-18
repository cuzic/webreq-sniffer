/**
 * Data Model Type Definitions
 * Based on docs/requirements.md Section 3
 */

// ========================================
// Settings (storage.sync)
// ========================================

export interface Presets {
  video: boolean;
  document: boolean;
  image: boolean;
}

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
}

export interface UISettings {
  showBadge: boolean;
}

export type TargetScope = 'activeTab' | 'allTabs';
export type HlsMpdMode = 'playlistOnly' | 'all';

export interface Settings {
  targetScope: TargetScope;
  presets: Presets;
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
  headers?: LogHeaders;
  dedupeKey: string; // Hash of (url + key headers) for deduplication
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

// ========================================
// Export Formats
// ========================================

export type ExportFormat =
  | 'url-list' // Plain text list of URLs (.txt)
  | 'bash-curl' // Bash script with curl commands
  | 'bash-curl-headers' // Bash script with curl + headers
  | 'bash-yt-dlp' // Bash script with yt-dlp commands
  | 'powershell'; // PowerShell script

export interface ExportOptions {
  format: ExportFormat;
  includeHeaders: boolean;
  filename?: string;
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
  | { type: 'export-logs'; payload: { format: ExportFormat } };

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

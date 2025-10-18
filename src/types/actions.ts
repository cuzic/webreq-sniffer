/**
 * Action Handler Types
 * Grouped action handlers to reduce prop drilling
 */

import type { LogEntry } from './models';

/**
 * Actions that can be performed on individual log entries
 */
export interface EntryActions {
  /** Copy entry URL to clipboard */
  onCopyUrl: (entry: LogEntry) => void;
  /** Open entry URL in a new tab */
  onOpenInTab: (entry: LogEntry) => void;
  /** Export single entry */
  onExport: (entry: LogEntry) => void;
  /** Show entry details dialog */
  onShowDetails: (entry: LogEntry) => void;
  /** Delete entry (optional) */
  onDelete?: (entry: LogEntry) => void;
  /** Copy curl command to clipboard (optional) */
  onCopyCurl?: (entry: LogEntry) => void;
  /** Copy curl command with headers to clipboard (optional) */
  onCopyCurlWithHeaders?: (entry: LogEntry) => void;
  /** Copy yt-dlp command to clipboard (optional) */
  onCopyYtDlp?: (entry: LogEntry) => void;
}

/**
 * Actions that can be performed on entry selection
 */
export interface SelectionActions {
  /** Toggle selection of a single entry */
  onToggle: (id: string) => void;
  /** Select all visible entries */
  onSelectAll: () => void;
  /** Clear all selections */
  onClearAll: () => void;
  /** Invert current selection */
  onInvertSelection: () => void;
}

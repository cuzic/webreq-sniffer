/**
 * Batch Download Common Utilities
 * Shared functions for batch download script generation
 */

import type { LogEntry, StreamVariant } from '@/types';

/**
 * Formatting constants
 */
export const FORMATTING = {
  LABEL_WIDTH: 8,
  RESOLUTION_WIDTH: 12,
} as const;

/**
 * Shell command type for quality menu
 */
export type ShellCommand = 'echo' | 'Write-Host';

/**
 * Format bandwidth in human-readable format
 */
export function formatBandwidth(bps: number): string {
  if (bps >= 1000000) {
    return `${(bps / 1000000).toFixed(1)} Mbps`;
  }
  return `${(bps / 1000).toFixed(0)} kbps`;
}

/**
 * Extract base filename from log entry
 */
export function extractBaseName(entry: LogEntry): string {
  const title =
    entry.pageMetadata?.pageTitle || entry.pageMetadata?.manifestMetadata?.title || 'video';
  // Sanitize for filesystem
  return title.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
}

/**
 * Escape shell string for Bash
 */
export function escapeShellString(str: string): string {
  // Escape double quotes and backslashes
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$');
}

/**
 * Escape string for PowerShell
 */
export function escapePowerShellString(str: string): string {
  // Escape double quotes
  return str.replace(/"/g, '`"');
}

/**
 * Build quality menu (unified for Bash and PowerShell)
 */
export function buildQualityMenu(variants: StreamVariant[], shellCmd: ShellCommand): string {
  return variants
    .map((v, idx) => {
      const num = idx + 1;
      const label = v.label || v.resolution || 'Unknown';
      const res = v.resolution || '';
      const bw = v.bandwidth ? formatBandwidth(v.bandwidth) : '';
      const padding = ' '.repeat(Math.max(0, FORMATTING.LABEL_WIDTH - label.length));
      const resPadding = ' '.repeat(Math.max(0, FORMATTING.RESOLUTION_WIDTH - res.length));
      return `${shellCmd} "${num}) ${label}${padding} ${res}${resPadding} (${bw})"`;
    })
    .join('\n');
}

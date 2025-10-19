/**
 * Export Module
 * Handles log export to various script formats
 *
 * This file provides backward compatibility by re-exporting from @/lib/export
 * and includes utility functions for export format detection.
 */

import type { LogEntry } from '@/types';

// Re-export all public APIs from the export library
export {
  // Escapers
  escapeShellArg,
  escapePowerShellArg,
  // Generators
  generateUrlList,
  generateBashCurl,
  generateBashCurlHeaders,
  generateBashYtDlp,
  generateBashYtDlpWithCookies,
  generatePowerShell,
  // Filename generation
  generateFilename,
  // Orchestration
  generateExportContent,
  exportLogs,
} from '@/lib/export';

/**
 * Check if entries contain manifest with variants
 * Used to determine which export formats are appropriate
 *
 * @param entries - Log entries to check
 * @returns True if entries contain a manifest with quality variants
 */
export function hasManifestVariants(entries: LogEntry[]): boolean {
  if (entries.length !== 1) {
    return false;
  }

  const variants = entries[0]?.pageMetadata?.manifestMetadata?.variants;
  return (variants?.length ?? 0) > 0;
}

/**
 * Check if entry URL is a manifest file
 *
 * @param url - URL to check
 * @returns True if URL appears to be an HLS (.m3u8) or DASH (.mpd) manifest
 */
export function isManifestUrl(url: string): boolean {
  const urlLower = url.toLowerCase();
  return urlLower.includes('.m3u8') || urlLower.includes('.mpd');
}

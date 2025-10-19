/**
 * Export Module
 * Handles log export to various script formats
 */

import type { LogEntry, ExportFormat, ExportSettings } from '@/types';
import { ExportError } from '@/lib/errors';
import { EXPORT } from '@/lib/constants';
import { renderTemplate } from '@/lib/template';
import { getBuiltInTemplate } from '@/lib/builtinTemplates';
import { sanitizeFilename } from '@/lib/filename';
import { safeEvaluateTemplate, type TemplateContext } from '@/lib/pipeline-template-engine';
import {
  generateBashBatchDownload,
  generatePowerShellBatchDownload,
} from '@/lib/batch-download-generator';
import { escapeShellArg } from '@/lib/export/escapers/shell-escaper';
import { escapePowerShellArg } from '@/lib/export/escapers/powershell-escaper';
import { generateUrlList } from '@/lib/export/generators/url-generator';
import {
  generateBashCurl,
  generateBashCurlHeaders,
  generateBashYtDlp,
  generateBashYtDlpWithCookies,
} from '@/lib/export/generators/bash-generator';
import { generatePowerShell } from '@/lib/export/generators/powershell-generator';

// Re-export for backward compatibility
export { escapeShellArg, escapePowerShellArg };
export { generateUrlList };
export {
  generateBashCurl,
  generateBashCurlHeaders,
  generateBashYtDlp,
  generateBashYtDlpWithCookies,
};
export { generatePowerShell };

/**
 * Check if entries contain manifest with variants
 * Used to determine which export formats are appropriate
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
 */
export function isManifestUrl(url: string): boolean {
  const urlLower = url.toLowerCase();
  return urlLower.includes('.m3u8') || urlLower.includes('.mpd');
}

/**
 * Generate filename from pipeline template
 */
export function generateFilename(
  template: string,
  format: ExportFormat,
  entries: LogEntry[]
): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const time = now.toISOString().slice(11, 19).replace(/:/g, '-'); // HH-mm-ss

  // Extract domain and metadata from first entry
  let domain: string = EXPORT.DEFAULT_DOMAIN;
  const firstEntry = entries.length > 0 ? entries[0] : null;
  const metadata = firstEntry?.pageMetadata;

  if (firstEntry) {
    try {
      const url = new URL(firstEntry.url);
      domain = url.hostname;
    } catch {
      // Invalid URL, use default
    }
  }

  // Determine extension
  const ext = EXPORT.EXTENSIONS[format];

  // Build template context
  const context: TemplateContext = {
    // System variables
    date,
    time,
    timestamp: Date.now(),
    domain,
    ext,

    // Page metadata (with fallbacks)
    pageTitle: metadata?.pageTitle,
    ogTitle: metadata?.ogTitle || metadata?.pageTitle,
    videoTitle: metadata?.videoTitle || metadata?.ogTitle || metadata?.pageTitle,
    metaTitle: metadata?.metaTitle || metadata?.pageTitle,
    metaDescription: metadata?.metaDescription,

    // Manifest metadata
    manifestTitle: metadata?.manifestMetadata?.title,
    manifestType: metadata?.manifestMetadata?.type,
    segmentPattern: metadata?.manifestMetadata?.segmentPattern,
    programDate: metadata?.manifestMetadata?.programDateTime
      ? new Date(metadata.manifestMetadata.programDateTime).toISOString().slice(0, 10)
      : undefined,
  };

  // Evaluate template with pipeline engine
  // Use 'untitled' as fallback if template evaluation fails
  const filename = safeEvaluateTemplate(template, context, `${domain}_${date}.${ext}`);

  // Sanitize filename (removes invalid filesystem characters)
  return sanitizeFilename(filename);
}

/**
 * Generate export content based on format
 * Batch download formats and cookie formats use specialized generators, others use templates
 */
export async function generateExportContent(
  entries: LogEntry[],
  format: ExportFormat
): Promise<string> {
  // Handle batch download formats specially
  if (format === 'bash-batch-download') {
    if (entries.length === 0) {
      throw new ExportError('No entries to export', { format });
    }
    return generateBashBatchDownload(entries[0]);
  }

  if (format === 'powershell-batch-download') {
    if (entries.length === 0) {
      throw new ExportError('No entries to export', { format });
    }
    return generatePowerShellBatchDownload(entries[0]);
  }

  // Handle cookie format (async)
  if (format === 'bash-yt-dlp-cookies') {
    return await generateBashYtDlpWithCookies(entries);
  }

  // All other formats use templates
  const template = getBuiltInTemplate(format);
  if (!template) {
    throw new ExportError(`Template not found for format: ${format}`, { format });
  }
  return renderTemplate(template.template, entries);
}

/**
 * Export logs to file
 */
export async function exportLogs(
  entries: LogEntry[],
  format: ExportFormat,
  exportSettings: ExportSettings
): Promise<string> {
  if (entries.length === 0) {
    throw new ExportError('No entries to export', { entryCount: 0 });
  }

  // Generate content
  const content = await generateExportContent(entries, format);

  // Apply newline settings
  const finalContent = exportSettings.newline === 'CRLF' ? content.replace(/\n/g, '\r\n') : content;

  // Generate filename
  const filename = generateFilename(exportSettings.filenameTemplate, format, entries);

  // Create blob
  const blob = new Blob([finalContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  // Download file
  const downloadId = await chrome.downloads.download({
    url,
    filename,
    saveAs: true,
  });

  // Clean up blob URL after download
  chrome.downloads.onChanged.addListener(function cleanup(delta) {
    if (delta.id === downloadId && delta.state?.current === 'complete') {
      URL.revokeObjectURL(url);
      chrome.downloads.onChanged.removeListener(cleanup);
    }
  });

  return filename;
}

/**
 * Export Orchestrator
 * Orchestrates the export process: content generation and file download
 */

import type { LogEntry, ExportFormat, ExportSettings } from '@/types';
import { ExportError } from '@/lib/errors';
import { renderTemplate } from '@/lib/template';
import { getBuiltInTemplate } from '@/lib/builtinTemplates';
import {
  generateBashBatchDownload,
  generatePowerShellBatchDownload,
} from '@/lib/batch-download-generator';
import { generateBashYtDlpWithCookies } from './generators/bash-generator';
import { generateFilename } from './filename-generator';

/**
 * Generate export content based on format
 *
 * Handles different export formats:
 * - Batch downloads (bash/powershell with quality selection)
 * - Cookie-aware downloads (yt-dlp with cookies)
 * - Template-based exports (all other formats)
 *
 * @param entries - Log entries to export
 * @param format - Export format
 * @returns Generated content string
 * @throws {ExportError} If no entries or template not found
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
 *
 * Full export workflow:
 * 1. Generate content based on format
 * 2. Apply newline settings (LF/CRLF)
 * 3. Generate filename from template
 * 4. Create blob and trigger download
 * 5. Clean up resources
 *
 * @param entries - Log entries to export
 * @param format - Export format
 * @param exportSettings - Export settings (filename template, newline)
 * @returns Generated filename
 * @throws {ExportError} If no entries to export
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

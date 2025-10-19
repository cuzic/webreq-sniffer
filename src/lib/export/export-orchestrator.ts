/**
 * Export Orchestrator
 * Orchestrates the export process: content generation and file download
 */

import type { LogEntry, ExportFormat, ExportSettings } from '@/types';
import { ExportError } from '@/lib/errors';
import { ExportGeneratorFactory } from './generator-factory';
import { generateFilename } from './filename-generator';

/**
 * Generate export content based on format
 *
 * Uses Factory Pattern to delegate to appropriate generator based on format.
 * Benefits:
 * - Open/Closed Principle: Easy to add new formats without modifying this function
 * - Single Responsibility: Each generator handles one specific format
 * - Better testability: Each generator can be tested independently
 *
 * @param entries - Log entries to export
 * @param format - Export format
 * @returns Generated content string
 * @throws {ExportError} If no entries or no generator found for format
 */
export async function generateExportContent(
  entries: LogEntry[],
  format: ExportFormat
): Promise<string> {
  const factory = new ExportGeneratorFactory();
  const generator = factory.getGenerator(format);
  return await generator.generate(entries);
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

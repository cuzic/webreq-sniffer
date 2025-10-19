/**
 * Filename Generator
 * Generates filenames from templates with metadata
 */

import type { LogEntry, ExportFormat } from '@/types';
import { EXPORT } from '@/lib/constants';
import { sanitizeFilename } from '@/lib/filename';
import { safeEvaluateTemplate, type TemplateContext } from '@/lib/pipeline-template-engine';

/**
 * Generate filename from pipeline template
 *
 * Supports placeholders:
 * - {date} - Current date (YYYY-MM-DD)
 * - {time} - Current time (HH-mm-ss)
 * - {timestamp} - Unix timestamp
 * - {domain} - Domain from first entry URL
 * - {ext} - File extension based on format
 * - {pageTitle} - Page title from metadata
 * - {ogTitle} - Open Graph title
 * - {videoTitle} - Video title (with cascading fallback)
 * - {metaTitle} - Meta title tag
 * - {manifestTitle} - Title from HLS/DASH manifest
 *
 * @param template - Filename template string
 * @param format - Export format (determines extension)
 * @param entries - Log entries (first entry used for metadata)
 * @returns Generated and sanitized filename
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

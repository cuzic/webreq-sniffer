/**
 * Mustache Template Engine
 * CSP-compliant template rendering for Chrome Extension
 * Replacement for Handlebars to resolve Issue #67
 */

import Mustache from 'mustache';
import type { LogEntry } from '@/types';
import { escapeShellArg } from '@/lib/export/escapers/shell-escaper';
import { escapePowerShellArg } from '@/lib/export/escapers/powershell-escaper';

/**
 * Enriched log entry with computed fields for template rendering
 */
export interface EnrichedLogEntry extends LogEntry {
  index: number;
  index1: number; // 1-based index
  domain: string;
  path: string;
  query: string;
  protocol: string;
  filename: string;
  fileExtension: string;
  formattedDate: string; // YYYY-MM-DD
  formattedDateISO: string; // ISO 8601
  formattedDateTime: string; // YYYY-MM-DD HH:mm:ss
  referer?: string;
  userAgent?: string;
  isLast: boolean;
  isNotLast: boolean;

  // Escaped versions for safe use in scripts
  urlEscaped: string; // Shell-escaped URL (with quotes)
  urlEscapedPowerShell: string; // PowerShell-escaped URL

  // Convenient access to headers
  headers: {
    'User-Agent'?: string;
    Referer?: string;
    Origin?: string;
    Accept?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Template rendering context
 * When rendering a single entry, all entry fields are available at top level
 */
type TemplateContext = {
  entries: EnrichedLogEntry[];
  totalEntries: number;
  exportDate: string;
  exportDateISO: string;
  domain: string; // Most common domain
} & Partial<EnrichedLogEntry>;

/**
 * Extract filename from URL
 */
function extractFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const match = pathname.match(/\/([^/?#]+)(?:[?#]|$)/);
    if (match && match[1]) {
      return match[1];
    }
    return 'file';
  } catch {
    return 'file';
  }
}

/**
 * Extract file extension from URL
 */
function extractExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const match = pathname.match(/\.([^./?#]+)(?:[?#]|$)/);
    if (match && match[1]) {
      return match[1];
    }
    return 'bin';
  } catch {
    return 'bin';
  }
}

/**
 * Format timestamp to YYYY-MM-DD (UTC)
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format timestamp to YYYY-MM-DD HH:mm:ss (UTC)
 */
function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get most common domain from entries
 */
function getMostCommonDomain(entries: LogEntry[]): string {
  if (entries.length === 0) return '';

  const domainCounts = new Map<string, number>();

  for (const entry of entries) {
    try {
      const url = new URL(entry.url);
      const domain = url.hostname;
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    } catch {
      // Skip invalid URLs
    }
  }

  let mostCommonDomain = '';
  let maxCount = 0;

  for (const [domain, count] of domainCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonDomain = domain;
    }
  }

  return mostCommonDomain;
}

/**
 * Enrich log entries with additional computed fields
 */
export function enrichEntries(entries: LogEntry[]): EnrichedLogEntry[] {
  const totalEntries = entries.length;

  return entries.map((entry, index) => {
    const isLast = index === totalEntries - 1;

    try {
      const url = new URL(entry.url);
      const enriched: EnrichedLogEntry = {
        ...entry,
        index,
        index1: index + 1,
        domain: url.hostname,
        path: url.pathname,
        query: url.search,
        protocol: url.protocol.replace(':', ''),
        filename: extractFilename(entry.url),
        fileExtension: extractExtension(entry.url),
        formattedDate: formatDate(entry.timestamp),
        formattedDateISO: new Date(entry.timestamp).toISOString(),
        formattedDateTime: formatDateTime(entry.timestamp),
        isLast,
        isNotLast: !isLast,
        urlEscaped: escapeShellArg(entry.url),
        urlEscapedPowerShell: escapePowerShellArg(entry.url),
        headers: {
          'User-Agent':
            entry.requestHeaders?.['User-Agent'] || entry.requestHeaders?.['user-agent'],
          Referer: entry.requestHeaders?.Referer || entry.requestHeaders?.referer,
          Origin: entry.requestHeaders?.Origin || entry.requestHeaders?.origin,
          Accept: entry.requestHeaders?.Accept || entry.requestHeaders?.accept,
          ...entry.requestHeaders,
        },
      };

      // Add helper values for common headers (backward compatibility)
      enriched.referer = enriched.headers.Referer;
      enriched.userAgent = enriched.headers['User-Agent'];

      return enriched;
    } catch {
      // If URL parsing fails, return basic enrichment
      const enriched: EnrichedLogEntry = {
        ...entry,
        index,
        index1: index + 1,
        domain: '',
        path: '',
        query: '',
        protocol: '',
        filename: 'file',
        fileExtension: 'bin',
        formattedDate: formatDate(entry.timestamp),
        formattedDateISO: new Date(entry.timestamp).toISOString(),
        formattedDateTime: formatDateTime(entry.timestamp),
        isLast,
        isNotLast: !isLast,
        urlEscaped: escapeShellArg(entry.url),
        urlEscapedPowerShell: escapePowerShellArg(entry.url),
        headers: {
          'User-Agent':
            entry.requestHeaders?.['User-Agent'] || entry.requestHeaders?.['user-agent'],
          Referer: entry.requestHeaders?.Referer || entry.requestHeaders?.referer,
          Origin: entry.requestHeaders?.Origin || entry.requestHeaders?.origin,
          Accept: entry.requestHeaders?.Accept || entry.requestHeaders?.accept,
          ...entry.requestHeaders,
        },
      };

      enriched.referer = enriched.headers.Referer;
      enriched.userAgent = enriched.headers['User-Agent'];

      return enriched;
    }
  });
}

/**
 * Template cache to avoid recompiling the same template
 */
const templateCache = new Map<string, string>();

/**
 * Clear the template cache (useful for testing or memory management)
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}

/**
 * Render a Mustache template with log entries
 *
 * @param template - Mustache template string
 * @param entries - Log entries to render
 * @returns Rendered template string
 */
export function renderTemplate(template: string, entries: LogEntry[]): string {
  const enrichedEntries = enrichEntries(entries);

  const context: TemplateContext = {
    entries: enrichedEntries,
    totalEntries: entries.length,
    exportDate: new Date().toLocaleString('ja-JP'),
    exportDateISO: new Date().toISOString(),
    domain: getMostCommonDomain(entries),
  };

  // For single entry, add fields at top level for convenience
  // This allows templates like {{url}} instead of requiring {{#entries}}{{url}}{{/entries}}
  if (enrichedEntries.length === 1 && enrichedEntries[0]) {
    Object.assign(context, enrichedEntries[0]);
  }

  // Mustache.render is CSP-compliant (no eval or new Function)
  return Mustache.render(template, context);
}

/**
 * Validate a Mustache template
 *
 * @param template - Template string to validate
 * @returns Validation result with error message if invalid
 */
export function validateTemplate(template: string): { valid: boolean; error?: string } {
  try {
    // Mustache.parse will throw if the template has syntax errors
    // It automatically validates matching section tags ({{#foo}} ... {{/foo}})
    const parsed = Mustache.parse(template);

    // Check for empty tags - traverse the token tree recursively
    function checkEmptyTags(tokens: unknown[][]): string | null {
      for (const token of tokens) {
        const [type, value, , , nestedTokens] = token as [
          string,
          string,
          number,
          number,
          unknown[]?,
        ];

        // Check if this token has an empty value
        if ((type === 'name' || type === '#' || type === '^') && value === '') {
          return 'Empty tag found';
        }

        // Recursively check nested tokens (for sections)
        if (nestedTokens && Array.isArray(nestedTokens)) {
          const error = checkEmptyTags(nestedTokens);
          if (error) return error;
        }
      }
      return null;
    }

    const error = checkEmptyTags(parsed);
    if (error) {
      return { valid: false, error };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Template parsing failed',
    };
  }
}

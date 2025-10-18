/**
 * Template Rendering Engine
 * Handles Handlebars template compilation and rendering
 */

import Handlebars from 'handlebars';
import type { LogEntry, EnrichedLogEntry } from '@/types';

// Register helper functions
Handlebars.registerHelper('formatDate', (timestamp: number, format: string) => {
  const date = new Date(timestamp);

  if (format === 'ISO') {
    return date.toISOString();
  }

  // Simple formatting for common patterns
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
});

Handlebars.registerHelper('escapeShell', (str: string) => {
  // Escape for bash single quotes
  return str.replace(/'/g, "'\\''");
});

Handlebars.registerHelper('escapePowershell', (str: string) => {
  return str.replace(/"/g, '""').replace(/`/g, '``');
});

Handlebars.registerHelper('urlEncode', (str: string) => {
  return encodeURIComponent(str);
});

Handlebars.registerHelper('base64', (str: string) => {
  return Buffer.from(str).toString('base64');
});

Handlebars.registerHelper('json', (obj: unknown) => {
  return JSON.stringify(obj);
});

Handlebars.registerHelper('upper', (str: string) => {
  return str.toUpperCase();
});

Handlebars.registerHelper('lower', (str: string) => {
  return str.toLowerCase();
});

Handlebars.registerHelper('truncate', (str: string, length: number) => {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
});

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
function enrichEntries(entries: LogEntry[]): EnrichedLogEntry[] {
  return entries.map((entry, index) => {
    try {
      const url = new URL(entry.url);
      return {
        ...entry,
        index,
        index1: index + 1,
        domain: url.hostname,
        path: url.pathname,
        query: url.search,
        protocol: url.protocol.replace(':', ''),
        filename: extractFilename(entry.url),
        fileExtension: extractExtension(entry.url),
      };
    } catch {
      // If URL parsing fails, return basic enrichment
      return {
        ...entry,
        index,
        index1: index + 1,
        domain: '',
        path: '',
        query: '',
        protocol: '',
        filename: 'file',
        fileExtension: 'bin',
      };
    }
  });
}

/**
 * Render a Handlebars template with log entries
 */
export function renderTemplate(template: string, entries: LogEntry[]): string {
  const compiled = Handlebars.compile(template);

  const enrichedEntries = enrichEntries(entries);

  const data = {
    entries: enrichedEntries,
    totalEntries: entries.length,
    exportDate: new Date().toLocaleString('ja-JP'),
    exportDateISO: new Date().toISOString(),
    domain: getMostCommonDomain(entries),
  };

  return compiled(data);
}

/**
 * Validate a Handlebars template
 */
export function validateTemplate(template: string): { valid: boolean; error?: string } {
  try {
    Handlebars.compile(template);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Template compilation failed',
    };
  }
}

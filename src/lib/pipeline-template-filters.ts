/**
 * Pipeline Template Filters
 * Safe filter functions for template processing
 */

import { sanitizeFilename } from './filename';

export type FilterFunction = (value: string, ...args: (string | number)[]) => string;

/**
 * String transformation filters
 */
export const filters: Record<string, FilterFunction> = {
  /**
   * Convert to lowercase
   */
  lowercase: (value: string): string => {
    return value.toLowerCase();
  },

  /**
   * Convert to uppercase
   */
  uppercase: (value: string): string => {
    return value.toUpperCase();
  },

  /**
   * Capitalize first letter
   */
  capitalize: (value: string): string => {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  },

  /**
   * Convert to slug format (lowercase, replace spaces with dashes, remove special chars)
   * Supports Unicode characters (e.g., Japanese, Chinese, etc.)
   */
  slugify: (value: string): string => {
    return value
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/[^\p{L}\p{N}-]/gu, '') // Keep letters, numbers, and dashes (Unicode-aware)
      .replace(/-+/g, '-') // Collapse multiple dashes
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
  },

  /**
   * Trim whitespace from both ends
   */
  trim: (value: string): string => {
    return value.trim();
  },

  /**
   * Truncate to specified length with optional suffix
   */
  truncate: (value: string, length: string | number, suffix?: string | number): string => {
    const len = Number(length);
    if (isNaN(len)) {
      throw new Error(`truncate: invalid length "${length}"`);
    }

    const suf = suffix !== undefined ? String(suffix) : '';

    if (value.length <= len) {
      return value;
    }

    return value.substring(0, len) + suf;
  },

  /**
   * Get substring
   */
  substring: (value: string, start: string | number, end?: string | number): string => {
    const startIdx = Number(start);
    if (isNaN(startIdx)) {
      throw new Error(`substring: invalid start "${start}"`);
    }

    if (end === undefined) {
      return value.substring(startIdx);
    }

    const endIdx = Number(end);
    if (isNaN(endIdx)) {
      throw new Error(`substring: invalid end "${end}"`);
    }

    return value.substring(startIdx, endIdx);
  },

  /**
   * Replace pattern with replacement
   */
  replace: (value: string, pattern: string | number, replacement: string | number): string => {
    if (pattern === undefined || pattern === null) {
      throw new Error('replace: pattern is required');
    }
    if (replacement === undefined || replacement === null) {
      throw new Error('replace: replacement is required');
    }

    const pat = String(pattern);
    const rep = String(replacement);

    // Simple string replacement (not regex for security)
    return value.split(pat).join(rep);
  },

  /**
   * Remove pattern from string
   */
  remove: (value: string, pattern: string | number): string => {
    if (pattern === undefined || pattern === null) {
      throw new Error('remove: pattern is required');
    }

    const pat = String(pattern);
    return value.split(pat).join('');
  },

  /**
   * Sanitize for filename
   */
  sanitize: (value: string): string => {
    return sanitizeFilename(value);
  },

  /**
   * Remove parentheses and brackets with their content
   */
  removeParens: (value: string): string => {
    return value.replace(/[【\[\(].*?[】\]\)]/g, '').trim();
  },

  /**
   * Return default value if input is empty/undefined
   */
  default: (value: string, defaultValue: string | number): string => {
    if (!value || value === 'undefined') {
      return String(defaultValue);
    }
    return value;
  },

  /**
   * Conditional: if value equals expected, return thenValue, else elseValue
   */
  ifEquals: (
    value: string,
    expected: string | number,
    thenValue: string | number,
    elseValue?: string | number
  ): string => {
    const exp = String(expected);
    if (value === exp) {
      return String(thenValue);
    }
    return elseValue !== undefined ? String(elseValue) : value;
  },

  /**
   * Conditional: if value contains substring, return thenValue, else elseValue
   */
  ifContains: (
    value: string,
    substring: string | number,
    thenValue: string | number,
    elseValue?: string | number
  ): string => {
    const sub = String(substring);
    if (value.includes(sub)) {
      return String(thenValue);
    }
    return elseValue !== undefined ? String(elseValue) : value;
  },

  /**
   * Conditional: if value is empty or undefined, return thenValue
   */
  ifEmpty: (value: string, thenValue: string | number): string => {
    if (!value || value === '' || value === 'undefined') {
      return String(thenValue);
    }
    return value;
  },
};

/**
 * Check if filter exists
 */
export function hasFilter(name: string): boolean {
  return name in filters;
}

/**
 * Get filter function by name
 */
export function getFilter(name: string): FilterFunction | undefined {
  return filters[name];
}

/**
 * Apply filter to value with arguments
 */
export function applyFilter(filterName: string, value: string, args: (string | number)[]): string {
  const filter = getFilter(filterName);

  if (!filter) {
    throw new Error(`Unknown filter: ${filterName}`);
  }

  try {
    return filter(value, ...args);
  } catch (error) {
    throw new Error(
      `Filter "${filterName}" failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

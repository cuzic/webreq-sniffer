/**
 * Shell Escaper
 * Handles escaping strings for Bash shell (single quotes)
 */

/**
 * Escape string for Bash shell (single quotes)
 *
 * In single quotes, only single quote needs escaping.
 * We escape it by ending the quote, adding escaped quote, and starting quote again.
 *
 * @param str - String to escape
 * @returns Escaped string wrapped in single quotes
 *
 * @example
 * escapeShellArg("it's a test") // => 'it'\''s a test'
 * escapeShellArg("simple") // => 'simple'
 */
export function escapeShellArg(str: string): string {
  return `'${str.replace(/'/g, "'\\''")}'`;
}

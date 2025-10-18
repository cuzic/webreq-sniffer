/**
 * Command Generator Functions
 * Generate shell commands from log entries
 */

import type { LogEntry } from '@/types';

/**
 * Generate a basic curl command
 */
export function generateCurlCommand(entry: LogEntry): string {
  const url = escapeShellArg(entry.url);
  return `curl ${url}`;
}

/**
 * Generate a curl command with headers
 */
export function generateCurlWithHeaders(entry: LogEntry): string {
  const url = escapeShellArg(entry.url);
  let command = `curl ${url}`;

  // Add request headers if available
  if (entry.requestHeaders && Object.keys(entry.requestHeaders).length > 0) {
    for (const [name, value] of Object.entries(entry.requestHeaders)) {
      // Skip pseudo-headers (HTTP/2)
      if (name.startsWith(':')) continue;

      command += ` \\\n  -H ${escapeShellArg(`${name}: ${value}`)}`;
    }
  }

  // Add method if not GET
  if (entry.method && entry.method !== 'GET') {
    command += ` \\\n  -X ${entry.method}`;
  }

  return command;
}

/**
 * Generate a yt-dlp command
 */
export function generateYtDlpCommand(entry: LogEntry): string {
  const url = escapeShellArg(entry.url);
  let command = `yt-dlp ${url}`;

  // Add referer if available
  if (entry.requestHeaders?.referer || entry.requestHeaders?.Referer) {
    const referer = entry.requestHeaders.referer || entry.requestHeaders.Referer;
    command += ` --referer ${escapeShellArg(referer)}`;
  }

  // Add user-agent if available
  if (entry.requestHeaders?.['user-agent'] || entry.requestHeaders?.['User-Agent']) {
    const userAgent = entry.requestHeaders['user-agent'] || entry.requestHeaders['User-Agent'];
    command += ` --user-agent ${escapeShellArg(userAgent)}`;
  }

  return command;
}

/**
 * Escape shell argument for safe use in commands
 */
function escapeShellArg(arg: string): string {
  // Use single quotes and escape any single quotes in the string
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

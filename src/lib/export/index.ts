/**
 * Export Module - Public API
 *
 * This module provides a unified interface for exporting logs to various formats.
 * It orchestrates the entire export process from content generation to file download.
 *
 * @module export
 */

// Escapers - String escaping for different shells
export { escapeShellArg } from './escapers/shell-escaper';
export { escapePowerShellArg } from './escapers/powershell-escaper';

// Generators - Script content generation
export { generateUrlList } from './generators/url-generator';
export {
  generateBashCurl,
  generateBashCurlHeaders,
  generateBashYtDlp,
  generateBashYtDlpWithCookies,
} from './generators/bash-generator';
export { generatePowerShell } from './generators/powershell-generator';

// Filename generation
export { generateFilename } from './filename-generator';

// Export orchestration - High-level export functions
export { generateExportContent, exportLogs } from './export-orchestrator';

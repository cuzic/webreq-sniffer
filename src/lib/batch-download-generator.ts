/**
 * Batch Download Script Generator (Main Export)
 * Re-exports functionality from modular implementation
 */

export { generateBashBatchDownload } from './batch-download/bash';
export { generatePowerShellBatchDownload } from './batch-download/powershell';

// Also export common utilities for advanced use cases
export {
  formatBandwidth,
  extractBaseName,
  escapeShellString,
  escapePowerShellString,
  buildQualityMenu,
  FORMATTING,
  type ShellCommand,
} from './batch-download/common';

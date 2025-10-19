/**
 * PowerShell Batch Download Script Generator
 * Generates interactive PowerShell scripts for downloading stream variants
 */

import type { LogEntry, StreamVariant } from '@/types';
import {
  escapePowerShellString,
  extractBaseName,
  formatBandwidth,
  buildQualityMenu,
} from './common';

/**
 * Build stream declarations for PowerShell
 */
function buildPowerShellStreamDeclarations(variants: StreamVariant[]): string {
  const lines: string[] = ['$Streams = @{}'];

  variants.forEach((v, idx) => {
    const num = idx + 1;
    const url = escapePowerShellString(v.url || '');
    const label = v.label || `${v.resolution || 'unknown'}`;
    const resolution = v.resolution || '';
    const bw = v.bandwidth ? formatBandwidth(v.bandwidth) : 'N/A';

    lines.push(`$Streams["${num}"] = "${url}|${label}|${resolution}|${bw}"`);
  });

  return lines.join('\n');
}

/**
 * Build quality menu for PowerShell
 */
function buildPowerShellQualityMenu(variants: StreamVariant[]): string {
  return buildQualityMenu(variants, 'Write-Host');
}

/**
 * Generate simple PowerShell download script (no variants)
 */
function generateSimplePowerShellDownload(entry: LogEntry): string {
  return `# Simple Video Downloader
# Source: ${entry.url}
# Generated: ${new Date().toISOString()}

$Url = "${escapePowerShellString(entry.url)}"
$Output = "${extractBaseName(entry)}.mp4"

if (Get-Command yt-dlp -ErrorAction SilentlyContinue) {
  yt-dlp -o $Output $Url
} elseif (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
  ffmpeg -i $Url -c copy $Output -y
} else {
  Write-Host "Error: Install yt-dlp or ffmpeg" -ForegroundColor Red
  exit 1
}
`;
}

/**
 * Generate PowerShell batch download script with stream variants
 */
export function generatePowerShellBatchDownload(entry: LogEntry): string {
  const variants = entry.pageMetadata?.manifestMetadata?.variants;

  if (!variants || variants.length === 0) {
    return generateSimplePowerShellDownload(entry);
  }

  return `# Batch Video Downloader
# Source: ${entry.url}
# Generated: ${new Date().toISOString()}

$MasterUrl = "${escapePowerShellString(entry.url)}"
$BaseName = "${extractBaseName(entry)}"

# Available qualities
${buildPowerShellStreamDeclarations(variants)}

Write-Host "Available video qualities:" -ForegroundColor Cyan
${buildPowerShellQualityMenu(variants)}
Write-Host ""
$selection = Read-Host "Select qualities (comma-separated, e.g., 1,3,4)"

# Download selected
$selected = $selection -split ',' | ForEach-Object { $_.Trim() }
foreach ($idx in $selected) {
  if ($Streams.ContainsKey($idx)) {
    $info = $Streams[$idx] -split '\\|'
    $url = $info[0]
    $quality = $info[1]
    $output = "\${BaseName}_\${quality}.mp4"

    Write-Host "Downloading $quality..." -ForegroundColor Yellow

    if (Get-Command yt-dlp -ErrorAction SilentlyContinue) {
      yt-dlp -o $output $url
    } elseif (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
      ffmpeg -i $url -c copy $output -y
    } else {
      Write-Host "Error: Install yt-dlp or ffmpeg" -ForegroundColor Red
      exit 1
    }
  }
}

Write-Host "Download complete" -ForegroundColor Green
`;
}

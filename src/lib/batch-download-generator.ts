/**
 * Batch Download Script Generator
 * Generates interactive bash/PowerShell scripts for downloading multiple stream variants
 */

import type { LogEntry, StreamVariant } from '@/types';

/**
 * Generate Bash batch download script
 */
export function generateBashBatchDownload(entry: LogEntry): string {
  const variants = entry.pageMetadata?.manifestMetadata?.variants;

  if (!variants || variants.length === 0) {
    // Fallback to simple download
    return generateSimpleBashDownload(entry);
  }

  return `#!/bin/bash
# Batch Video Downloader
# Source: ${entry.url}
# Generated: ${new Date().toISOString()}

MASTER_URL="${escapeShellString(entry.url)}"
BASE_NAME="${extractBaseName(entry)}"

# Available qualities
${buildBashStreamDeclarations(variants)}

echo "Available video qualities:"
${buildBashQualityMenu(variants)}
echo ""
read -p "Select qualities (comma-separated, e.g., 1,3,4): " selection

# Download selected
IFS=',' read -ra SELECTED <<< "$selection"
for idx in "\${SELECTED[@]}"; do
  idx=\$(echo "$idx" | xargs)  # trim
  if [[ -n "\${STREAMS[$idx]}" ]]; then
    IFS='|' read -ra INFO <<< "\${STREAMS[$idx]}"
    URL="\${INFO[0]}"
    QUALITY="\${INFO[1]}"
    OUTPUT="\${BASE_NAME}_\${QUALITY}.mp4"

    echo "Downloading $QUALITY..."
    if command -v yt-dlp &> /dev/null; then
      yt-dlp -o "$OUTPUT" "$URL"
    elif command -v ffmpeg &> /dev/null; then
      ffmpeg -i "$URL" -c copy "$OUTPUT" -y
    else
      echo "Error: Install yt-dlp or ffmpeg"
      exit 1
    fi
  fi
done

echo "Download complete"
`;
}

/**
 * Generate PowerShell batch download script
 */
export function generatePowerShellBatchDownload(entry: LogEntry): string {
  const variants = entry.pageMetadata?.manifestMetadata?.variants;

  if (!variants || variants.length === 0) {
    // Fallback to simple download
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
    $output = "$\{BaseName}_$\{quality}.mp4"

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

/**
 * Helper: Build stream declarations for Bash
 */
function buildBashStreamDeclarations(variants: StreamVariant[]): string {
  const lines: string[] = ['declare -A STREAMS'];

  variants.forEach((v, idx) => {
    const num = idx + 1;
    const url = escapeShellString(v.url || '');
    const label = v.label || `${v.resolution || 'unknown'}`;
    const resolution = v.resolution || '';
    const bw = v.bandwidth ? formatBandwidth(v.bandwidth) : 'N/A';

    lines.push(`STREAMS[${num}]="${url}|${label}|${resolution}|${bw}"`);
  });

  return lines.join('\n');
}

/**
 * Helper: Build quality menu for Bash
 */
function buildBashQualityMenu(variants: StreamVariant[]): string {
  return variants
    .map((v, idx) => {
      const num = idx + 1;
      const label = v.label || v.resolution || 'Unknown';
      const res = v.resolution || '';
      const bw = v.bandwidth ? formatBandwidth(v.bandwidth) : '';
      const padding = ' '.repeat(Math.max(0, 8 - label.length));
      const resPadding = ' '.repeat(Math.max(0, 12 - res.length));
      return `echo "${num}) ${label}${padding} ${res}${resPadding} (${bw})"`;
    })
    .join('\n');
}

/**
 * Helper: Build stream declarations for PowerShell
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
 * Helper: Build quality menu for PowerShell
 */
function buildPowerShellQualityMenu(variants: StreamVariant[]): string {
  return variants
    .map((v, idx) => {
      const num = idx + 1;
      const label = v.label || v.resolution || 'Unknown';
      const res = v.resolution || '';
      const bw = v.bandwidth ? formatBandwidth(v.bandwidth) : '';
      const padding = ' '.repeat(Math.max(0, 8 - label.length));
      const resPadding = ' '.repeat(Math.max(0, 12 - res.length));
      return `Write-Host "${num}) ${label}${padding} ${res}${resPadding} (${bw})"`;
    })
    .join('\n');
}

/**
 * Helper: Format bandwidth
 */
function formatBandwidth(bps: number): string {
  if (bps >= 1000000) {
    return `${(bps / 1000000).toFixed(1)} Mbps`;
  }
  return `${(bps / 1000).toFixed(0)} kbps`;
}

/**
 * Helper: Extract base filename from URL
 */
function extractBaseName(entry: LogEntry): string {
  const title =
    entry.pageMetadata?.pageTitle || entry.pageMetadata?.manifestMetadata?.title || 'video';
  // Sanitize for filesystem
  return title.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
}

/**
 * Helper: Escape shell string for Bash
 */
function escapeShellString(str: string): string {
  // Escape double quotes and backslashes
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$');
}

/**
 * Helper: Escape string for PowerShell
 */
function escapePowerShellString(str: string): string {
  // Escape double quotes
  return str.replace(/"/g, '`"');
}

/**
 * Fallback: Simple download script (no variants) - Bash
 */
function generateSimpleBashDownload(entry: LogEntry): string {
  return `#!/bin/bash
# Simple Video Downloader
# Source: ${entry.url}
# Generated: ${new Date().toISOString()}

URL="${escapeShellString(entry.url)}"
OUTPUT="${extractBaseName(entry)}.mp4"

if command -v yt-dlp &> /dev/null; then
  yt-dlp -o "$OUTPUT" "$URL"
elif command -v ffmpeg &> /dev/null; then
  ffmpeg -i "$URL" -c copy "$OUTPUT" -y
else
  echo "Error: Install yt-dlp or ffmpeg"
  exit 1
fi
`;
}

/**
 * Fallback: Simple download script (no variants) - PowerShell
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

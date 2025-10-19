/**
 * Bash Batch Download Script Generator
 * Generates interactive bash scripts for downloading stream variants
 */

import type { LogEntry, StreamVariant } from '@/types';
import { escapeShellString, extractBaseName, formatBandwidth, buildQualityMenu } from './common';

/**
 * Build stream declarations for Bash
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
 * Build quality menu for Bash
 */
function buildBashQualityMenu(variants: StreamVariant[]): string {
  return buildQualityMenu(variants, 'echo');
}

/**
 * Generate simple Bash download script (no variants)
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
 * Generate Bash batch download script with stream variants
 */
export function generateBashBatchDownload(entry: LogEntry): string {
  const variants = entry.pageMetadata?.manifestMetadata?.variants;

  if (!variants || variants.length === 0) {
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

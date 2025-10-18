# Batch Download Script Generator - Design Document

**Issue**: #55
**Date**: 2025-10-18
**Status**: Phase 1 Complete, Phase 2 Design

## Overview

Generate interactive batch download scripts for HLS/DASH manifests with multiple quality options. Users can select multiple resolutions at once and download them sequentially.

## Completed: Phase 1 - Stream Extraction

✅ StreamVariant type definition
✅ HLS #EXT-X-STREAM-INF parser
✅ DASH <Representation> parser
✅ Export format type definitions

## Phase 2: Script Generation - Simplified Design

### Design Principles

1. **Template-based approach** - Use string templates instead of complex builders
2. **Single responsibility** - One function per script type
3. **Reusable helpers** - Share common formatting logic
4. **No external dependencies** - Pure TypeScript/JavaScript

### Architecture

```
src/lib/
  batch-download-generator.ts  (NEW)
    ├── generateBashBatchDownload()
    ├── generatePowerShellBatchDownload()
    └── Helper functions:
        ├── formatBandwidth()
        ├── buildStreamMap()
        └── escapeShellString()
```

### Implementation Strategy

#### Option A: Full Implementation (~500 lines)

- Complete interactive UI with colors
- Range selection (1-3), multiple (1,3,4), all
- Progress tracking
- Error handling and retry logic
- Download summary

**Pros**: Rich UX, complete feature set
**Cons**: Large codebase, complex to maintain

#### Option B: Minimal Viable Product (~200 lines) ⭐ RECOMMENDED

- Simple numbered menu
- Comma-separated selection only (1,2,4)
- Basic yt-dlp/ffmpeg commands
- Success/failure reporting

**Pros**: Quick to implement, easy to maintain
**Cons**: Less polished UX

#### Option C: Hybrid Approach (~300 lines)

- Simple menu with basic colors
- Support: comma-separated + "all"
- Basic progress (N/M)
- Simple error handling

**Pros**: Good balance of features and complexity
**Cons**: Middle ground

### Recommended: Option B - MVP Implementation

```typescript
// src/lib/batch-download-generator.ts

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

MASTER_URL="${entry.url}"
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
    OUTPUT="${BASE_NAME}_\${QUALITY}.mp4"

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
 * Helper: Build stream declarations for Bash
 */
function buildBashStreamDeclarations(variants: StreamVariant[]): string {
  const lines: string[] = ['declare -A STREAMS'];

  variants.forEach((v, idx) => {
    const num = idx + 1;
    const url = v.url || '';
    const label = v.label || `${v.resolution || 'unknown'}`;
    const bw = v.bandwidth ? formatBandwidth(v.bandwidth) : 'N/A';

    lines.push(`STREAMS[${num}]="${url}|${label}|${v.resolution || ''}|${bw}"`);
  });

  return lines.join('\n');
}

/**
 * Helper: Build quality menu
 */
function buildBashQualityMenu(variants: StreamVariant[]): string {
  return variants
    .map((v, idx) => {
      const num = idx + 1;
      const label = v.label || v.resolution || 'Unknown';
      const res = v.resolution || '';
      const bw = v.bandwidth ? formatBandwidth(v.bandwidth) : '';
      return `echo "${num}) ${label.padEnd(8)} ${res.padEnd(12)} (${bw})"`;
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
 * Fallback: Simple download script (no variants)
 */
function generateSimpleBashDownload(entry: LogEntry): string {
  return `#!/bin/bash
# Simple Video Downloader
# Source: ${entry.url}

URL="${entry.url}"
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
```

### PowerShell Version

Similar structure with PowerShell syntax:

- Use `$Streams` hashtable
- `Read-Host` for input
- `Write-Host` with `-ForegroundColor`
- `Invoke-WebRequest` or external tools

### Integration Points

1. **Export System** (`src/background/export.ts`)

   ```typescript
   case 'bash-batch-download':
     return generateBashBatchDownload(entries[0]);
   case 'powershell-batch-download':
     return generatePowerShellBatchDownload(entries[0]);
   ```

2. **Type Guards**
   - Only enable for manifest entries with variants
   - Check `entry.pageMetadata?.manifestMetadata?.variants?.length > 0`

3. **UI Updates** (Phase 3)
   - Add to export format dropdown
   - Show only for manifest URLs (.m3u8, .mpd)
   - Add tooltip explaining the feature

## Testing Strategy

### Unit Tests

```typescript
describe('generateBashBatchDownload', () => {
  it('generates script with stream variants', () => {
    const entry = createMockEntry({
      variants: [
        { url: '1080p.m3u8', label: '1080p', resolution: '1920x1080', bandwidth: 5000000 },
        { url: '720p.m3u8', label: '720p', resolution: '1280x720', bandwidth: 2800000 },
      ],
    });

    const script = generateBashBatchDownload(entry);

    expect(script).toContain('STREAMS[1]="1080p.m3u8|1080p');
    expect(script).toContain('STREAMS[2]="720p.m3u8|720p');
    expect(script).toContain('Available video qualities');
  });

  it('falls back to simple download when no variants', () => {
    const entry = createMockEntry({ variants: [] });
    const script = generateBashBatchDownload(entry);
    expect(script).toContain('Simple Video Downloader');
  });
});
```

### Manual Testing

1. Create test manifest with variants
2. Generate script
3. Run script locally
4. Verify:
   - Menu displays correctly
   - Selection parsing works
   - Download commands execute
   - Files are named correctly

## Implementation Timeline

### MVP (Option B) - Estimated 2-3 hours

1. **Create batch-download-generator.ts** (1h)
   - Bash generator function
   - PowerShell generator function
   - Helper functions

2. **Integrate with export.ts** (30min)
   - Add cases for new formats
   - Add format detection

3. **Add unit tests** (1h)
   - Test script generation
   - Test edge cases

4. **Manual testing** (30min)
   - Test with real manifests
   - Verify downloads work

### Future Enhancements (Post-MVP)

- [ ] Add range selection (1-3)
- [ ] Add progress bars
- [ ] Add colored output
- [ ] Add download resumption
- [ ] Add parallel downloads (advanced)
- [ ] Add bandwidth limiting options

## Decision: Go with Option B (MVP)

**Rationale:**

1. **Quick delivery** - Can complete in 2-3 hours
2. **User value** - Core functionality is selection + batch download
3. **Maintainable** - Simple code, easy to extend later
4. **Low risk** - Small surface area for bugs

The MVP provides 80% of the value with 20% of the complexity. We can iterate based on user feedback.

## Next Steps

1. Implement `batch-download-generator.ts` with Option B design
2. Integrate into export system
3. Add basic tests
4. Manual verification
5. Document in README
6. Close Issue #55

## References

- Issue #55: https://github.com/cuzic/webreq-sniffer/issues/55
- HLS RFC 8216: https://datatracker.ietf.org/doc/html/rfc8216
- DASH ISO/IEC 23009-1: https://www.iso.org/standard/79329.html

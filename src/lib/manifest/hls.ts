/**
 * HLS Manifest Parser
 * Parses HLS (.m3u8) manifest files to extract metadata
 */

import type { ManifestMetadata, StreamVariant } from '@/types';
import { Logger } from '../logger';

/**
 * Parse HLS (m3u8) manifest content
 */
export function parseHLSManifest(content: string): ManifestMetadata | null {
  try {
    const lines = content.split('\n').map((line) => line.trim());

    const metadata: ManifestMetadata = {
      type: 'hls',
    };

    const variants: StreamVariant[] = [];

    // Extract metadata and stream variants from HLS tags
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue; // Skip if line is undefined

      // #EXT-X-TITLE (non-standard but sometimes used)
      if (line.startsWith('#EXT-X-TITLE:')) {
        metadata.title = line.substring('#EXT-X-TITLE:'.length).trim();
      }

      // #EXT-X-PROGRAM-DATE-TIME
      if (line.startsWith('#EXT-X-PROGRAM-DATE-TIME:')) {
        metadata.programDateTime = line.substring('#EXT-X-PROGRAM-DATE-TIME:'.length).trim();
      }

      // #EXT-X-TARGETDURATION
      if (line.startsWith('#EXT-X-TARGETDURATION:')) {
        const duration = parseInt(line.substring('#EXT-X-TARGETDURATION:'.length).trim(), 10);
        if (!isNaN(duration)) {
          metadata.targetDuration = duration;
        }
      }

      // #EXT-X-STREAM-INF (stream variants for master playlists)
      if (line.startsWith('#EXT-X-STREAM-INF:')) {
        const nextLine = i + 1 < lines.length ? lines[i + 1] : undefined;
        const variant = parseHLSStreamInf(line, nextLine);
        if (variant) {
          variants.push(variant);
        }
      }
    }

    // Add variants if found
    if (variants.length > 0) {
      metadata.variants = variants;
    }

    // Extract segment pattern from URLs (only if not a master playlist)
    if (variants.length === 0) {
      const segmentUrls = lines.filter(
        (line) => !line.startsWith('#') && line.length > 0 && !line.startsWith('http')
      );

      if (segmentUrls.length > 0) {
        // Find common pattern in segment URLs
        metadata.segmentPattern = extractSegmentPattern(segmentUrls);
      }
    }

    return metadata;
  } catch (error) {
    Logger.error('manifest-parser', error, { type: 'HLS' });
    return null;
  }
}

/**
 * Extract common pattern from segment URLs
 * Example: ["segment001.ts", "segment002.ts"] → "segment*.ts"
 */
function extractSegmentPattern(urls: string[]): string | undefined {
  if (urls.length === 0) return undefined;

  // Take first URL as base
  const firstUrl = urls[0];
  if (!firstUrl) return undefined; // Handle potentially undefined array access

  // Simple pattern: replace numbers with *
  const pattern = firstUrl.replace(/\d+/g, '*');

  return pattern;
}

/**
 * Parse #EXT-X-STREAM-INF tag to extract stream variant information
 * Example: #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360,CODECS="avc1.42e01e,mp4a.40.2"
 */
function parseHLSStreamInf(
  streamInfLine: string,
  urlLine: string | undefined
): StreamVariant | null {
  if (!urlLine || urlLine.startsWith('#')) {
    return null;
  }

  const variant: StreamVariant = {
    url: urlLine.trim(),
  };

  // Extract attributes from #EXT-X-STREAM-INF line
  const attributesStr = streamInfLine.substring('#EXT-X-STREAM-INF:'.length);

  // Parse BANDWIDTH
  const bandwidthMatch = attributesStr.match(/BANDWIDTH=(\d+)/);
  if (bandwidthMatch && bandwidthMatch[1]) {
    variant.bandwidth = parseInt(bandwidthMatch[1], 10);
  }

  // Parse RESOLUTION
  const resolutionMatch = attributesStr.match(/RESOLUTION=(\d+x\d+)/);
  if (resolutionMatch && resolutionMatch[1]) {
    variant.resolution = resolutionMatch[1];

    // Generate label from resolution
    const heightStr = resolutionMatch[1].split('x')[1];
    if (heightStr) {
      const height = parseInt(heightStr, 10);
      variant.label = `${height}p`;
    }
  }

  // Parse CODECS
  const codecsMatch = attributesStr.match(/CODECS="([^"]+)"/);
  if (codecsMatch && codecsMatch[1]) {
    variant.codecs = codecsMatch[1];
  }

  // Parse FRAME-RATE
  const frameRateMatch = attributesStr.match(/FRAME-RATE=([\d.]+)/);
  if (frameRateMatch && frameRateMatch[1]) {
    variant.frameRate = parseFloat(frameRateMatch[1]);
  }

  return variant;
}

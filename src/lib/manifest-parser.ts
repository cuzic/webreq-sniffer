/**
 * Manifest Parser
 * Parses HLS (.m3u8) and DASH (.mpd) manifest files to extract metadata
 */

import type { ManifestMetadata } from '@/types';

/**
 * Parse HLS (m3u8) manifest content
 */
export function parseHLSManifest(content: string): ManifestMetadata | null {
  try {
    const lines = content.split('\n').map((line) => line.trim());

    const metadata: ManifestMetadata = {
      type: 'hls',
    };

    // Extract metadata from HLS tags
    for (const line of lines) {
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
    }

    // Extract segment pattern from URLs
    const segmentUrls = lines.filter(
      (line) => !line.startsWith('#') && line.length > 0 && !line.startsWith('http')
    );

    if (segmentUrls.length > 0) {
      // Find common pattern in segment URLs
      metadata.segmentPattern = extractSegmentPattern(segmentUrls);
    }

    return metadata;
  } catch (error) {
    console.error('Failed to parse HLS manifest:', error);
    return null;
  }
}

/**
 * Parse DASH (mpd) manifest content
 */
export function parseDASHManifest(content: string): ManifestMetadata | null {
  try {
    const metadata: ManifestMetadata = {
      type: 'dash',
    };

    // Parse as XML to extract metadata
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('XML parsing error:', parseError.textContent);
      return null;
    }

    // Extract title from MPD element
    const mpdElement = xmlDoc.querySelector('MPD');
    if (mpdElement) {
      const titleAttr = mpdElement.getAttribute('title');
      if (titleAttr) {
        metadata.title = titleAttr;
      }

      // Extract program information
      const programInfo = xmlDoc.querySelector('ProgramInformation Title');
      if (programInfo && programInfo.textContent) {
        metadata.title = programInfo.textContent.trim();
      }
    }

    // Extract segment template pattern
    const segmentTemplate = xmlDoc.querySelector('SegmentTemplate');
    if (segmentTemplate) {
      const mediaAttr = segmentTemplate.getAttribute('media');
      if (mediaAttr) {
        metadata.segmentPattern = mediaAttr;
      }
    }

    return metadata;
  } catch (error) {
    console.error('Failed to parse DASH manifest:', error);
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

  // Simple pattern: replace numbers with *
  const pattern = firstUrl.replace(/\d+/g, '*');

  return pattern;
}

/**
 * Detect manifest type from URL
 */
export function detectManifestType(url: string): 'hls' | 'dash' | null {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('.m3u8') || urlLower.includes('.m3u')) {
    return 'hls';
  }

  if (urlLower.includes('.mpd')) {
    return 'dash';
  }

  return null;
}

/**
 * Fetch and parse manifest from URL
 */
export async function fetchAndParseManifest(url: string): Promise<ManifestMetadata | null> {
  try {
    const manifestType = detectManifestType(url);
    if (!manifestType) {
      return null;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
      return null;
    }

    const content = await response.text();

    if (manifestType === 'hls') {
      return parseHLSManifest(content);
    } else if (manifestType === 'dash') {
      return parseDASHManifest(content);
    }

    return null;
  } catch (error) {
    console.error('Error fetching/parsing manifest:', error);
    return null;
  }
}

/**
 * Manifest Parser
 * Parses HLS (.m3u8) and DASH (.mpd) manifest files to extract metadata
 */

import type { ManifestMetadata, StreamVariant } from '@/types';

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
        const variant = parseHLSStreamInf(line, lines[i + 1]);
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

    // Extract stream variants from Representation elements
    const variants: StreamVariant[] = [];
    const representations = xmlDoc.querySelectorAll('Representation');

    representations.forEach((repr) => {
      const variant = parseDASHRepresentation(repr);
      if (variant) {
        variants.push(variant);
      }
    });

    // Add variants if found
    if (variants.length > 0) {
      // Sort by bandwidth (descending)
      variants.sort((a, b) => (b.bandwidth || 0) - (a.bandwidth || 0));
      metadata.variants = variants;
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
  if (bandwidthMatch) {
    variant.bandwidth = parseInt(bandwidthMatch[1], 10);
  }

  // Parse RESOLUTION
  const resolutionMatch = attributesStr.match(/RESOLUTION=(\d+x\d+)/);
  if (resolutionMatch) {
    variant.resolution = resolutionMatch[1];

    // Generate label from resolution
    const height = parseInt(resolutionMatch[1].split('x')[1], 10);
    variant.label = `${height}p`;
  }

  // Parse CODECS
  const codecsMatch = attributesStr.match(/CODECS="([^"]+)"/);
  if (codecsMatch) {
    variant.codecs = codecsMatch[1];
  }

  // Parse FRAME-RATE
  const frameRateMatch = attributesStr.match(/FRAME-RATE=([\d.]+)/);
  if (frameRateMatch) {
    variant.frameRate = parseFloat(frameRateMatch[1]);
  }

  return variant;
}

/**
 * Parse DASH Representation element to extract stream variant information
 */
function parseDASHRepresentation(repr: Element): StreamVariant | null {
  const variant: StreamVariant = {};

  // Extract ID (used as URL identifier)
  const id = repr.getAttribute('id');
  if (id) {
    variant.url = id;
  }

  // Parse bandwidth
  const bandwidth = repr.getAttribute('bandwidth');
  if (bandwidth) {
    variant.bandwidth = parseInt(bandwidth, 10);
  }

  // Parse width and height to create resolution
  const width = repr.getAttribute('width');
  const height = repr.getAttribute('height');
  if (width && height) {
    variant.resolution = `${width}x${height}`;
    variant.label = `${height}p`;
  }

  // Parse codecs
  const codecs = repr.getAttribute('codecs');
  if (codecs) {
    variant.codecs = codecs;
  }

  // Parse frame rate
  const frameRate = repr.getAttribute('frameRate');
  if (frameRate) {
    variant.frameRate = parseFloat(frameRate);
  }

  return variant;
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

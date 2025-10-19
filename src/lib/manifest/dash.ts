/**
 * DASH Manifest Parser
 * Parses DASH (.mpd) manifest files to extract metadata
 */

import type { ManifestMetadata, StreamVariant } from '@/types';
import { Logger } from '../logger';

/**
 * Check if DASH manifest content is a master MPD
 * Master MPD files contain Representation elements
 * Segment files (.m4s) are not MPD files
 */
export function isDASHMasterPlaylist(content: string): boolean {
  if (!content || content.trim().length === 0) {
    return false;
  }

  try {
    // Parse as XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      return false;
    }

    // Master MPD must have Representation elements
    const representations = xmlDoc.querySelectorAll('Representation');
    return representations.length > 0;
  } catch (error) {
    Logger.error('manifest-parser', error, { type: 'DASH-master-check' });
    return false;
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
      Logger.error('manifest-parser', parseError.textContent, { type: 'DASH-XML' });
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
    Logger.error('manifest-parser', error, { type: 'DASH' });
    return null;
  }
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

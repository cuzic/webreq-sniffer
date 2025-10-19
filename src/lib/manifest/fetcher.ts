/**
 * Manifest Fetcher
 * Handles fetching and type detection for manifest files
 */

import type { ManifestMetadata } from '@/types';
import { parseHLSManifest } from './hls';
import { parseDASHManifest } from './dash';
import { Logger } from '../logger';

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
      Logger.error(
        'manifest-parser',
        `Failed to fetch manifest: ${response.status} ${response.statusText}`,
        { url, status: response.status }
      );
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
    Logger.error('manifest-parser', error, { url, context: 'fetch/parse' });
    return null;
  }
}

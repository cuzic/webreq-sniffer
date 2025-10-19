/**
 * Manifest Parser (Main Export)
 * Re-exports functionality from modular implementation
 */

import { isHLSMasterPlaylist } from './manifest/hls';
import { isDASHMasterPlaylist } from './manifest/dash';

export { parseHLSManifest, isHLSMasterPlaylist } from './manifest/hls';
export { parseDASHManifest, isDASHMasterPlaylist } from './manifest/dash';
export { detectManifestType, fetchAndParseManifest } from './manifest/fetcher';

/**
 * Check if manifest content represents a master playlist
 * Master playlists list variants (HLS) or representations (DASH)
 * Media playlists list individual segments
 *
 * @param content - Raw manifest content
 * @param type - Manifest type ('hls' or 'dash')
 * @returns true if master/parent playlist, false if media/child playlist
 */
export function isMasterPlaylist(content: string, type: 'hls' | 'dash' | null): boolean {
  if (!content || !type) {
    return false;
  }

  switch (type) {
    case 'hls':
      return isHLSMasterPlaylist(content);
    case 'dash':
      return isDASHMasterPlaylist(content);
    default:
      return false;
  }
}

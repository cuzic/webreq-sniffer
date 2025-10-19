/**
 * Manifest Parser (Main Export)
 * Re-exports functionality from modular implementation
 */

export { parseHLSManifest } from './manifest/hls';
export { parseDASHManifest } from './manifest/dash';
export { detectManifestType, fetchAndParseManifest } from './manifest/fetcher';

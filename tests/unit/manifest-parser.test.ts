/**
 * Unit Tests for Manifest Parser
 */

import { describe, it, expect } from 'vitest';
import { parseHLSManifest, parseDASHManifest, detectManifestType } from '@/lib/manifest-parser';

describe('Manifest Parser', () => {
  describe('detectManifestType', () => {
    it('should detect HLS from .m3u8 extension', () => {
      expect(detectManifestType('https://example.com/playlist.m3u8')).toBe('hls');
      expect(detectManifestType('https://example.com/master.M3U8')).toBe('hls');
      expect(detectManifestType('https://example.com/stream.m3u')).toBe('hls');
    });

    it('should detect DASH from .mpd extension', () => {
      expect(detectManifestType('https://example.com/manifest.mpd')).toBe('dash');
      expect(detectManifestType('https://example.com/video.MPD')).toBe('dash');
    });

    it('should return null for non-manifest URLs', () => {
      expect(detectManifestType('https://example.com/video.mp4')).toBe(null);
      expect(detectManifestType('https://example.com/page.html')).toBe(null);
    });
  });

  describe('parseHLSManifest', () => {
    it('should parse basic HLS manifest', () => {
      const manifest = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.9,
segment001.ts
#EXTINF:9.9,
segment002.ts
#EXT-X-ENDLIST`;

      const result = parseHLSManifest(manifest);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('hls');
      expect(result?.targetDuration).toBe(10);
    });

    it('should extract title from EXT-X-TITLE tag', () => {
      const manifest = `#EXTM3U
#EXT-X-TITLE:My Video Title
#EXT-X-VERSION:3
#EXTINF:9.9,
segment001.ts`;

      const result = parseHLSManifest(manifest);
      expect(result?.title).toBe('My Video Title');
    });

    it('should extract program date time', () => {
      const manifest = `#EXTM3U
#EXT-X-PROGRAM-DATE-TIME:2024-10-18T12:00:00Z
#EXTINF:9.9,
segment001.ts`;

      const result = parseHLSManifest(manifest);
      expect(result?.programDateTime).toBe('2024-10-18T12:00:00Z');
    });

    it('should extract segment pattern', () => {
      const manifest = `#EXTM3U
#EXTINF:9.9,
segment001.ts
#EXTINF:9.9,
segment002.ts
#EXTINF:9.9,
segment003.ts`;

      const result = parseHLSManifest(manifest);
      expect(result?.segmentPattern).toBe('segment*.ts');
    });

    it('should handle empty manifest gracefully', () => {
      const result = parseHLSManifest('');
      expect(result).not.toBeNull();
      expect(result?.type).toBe('hls');
    });
  });

  describe('parseDASHManifest', () => {
    it('should parse basic DASH manifest', () => {
      const manifest = `<?xml version="1.0"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011" title="Video Title">
  <Period>
    <AdaptationSet>
      <Representation></Representation>
    </AdaptationSet>
  </Period>
</MPD>`;

      const result = parseDASHManifest(manifest);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('dash');
      expect(result?.title).toBe('Video Title');
    });

    it('should extract title from ProgramInformation', () => {
      const manifest = `<?xml version="1.0"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
  <ProgramInformation>
    <Title>Program Title</Title>
  </ProgramInformation>
</MPD>`;

      const result = parseDASHManifest(manifest);
      expect(result?.title).toBe('Program Title');
    });

    it('should extract segment template pattern', () => {
      const manifest = `<?xml version="1.0"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
  <Period>
    <AdaptationSet>
      <SegmentTemplate media="segment-$Number$.m4s"></SegmentTemplate>
    </AdaptationSet>
  </Period>
</MPD>`;

      const result = parseDASHManifest(manifest);
      expect(result?.segmentPattern).toBe('segment-$Number$.m4s');
    });

    it('should handle invalid XML gracefully', () => {
      const result = parseDASHManifest('not valid xml');
      expect(result).toBeNull();
    });

    it('should handle empty manifest', () => {
      const manifest = `<?xml version="1.0"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
</MPD>`;

      const result = parseDASHManifest(manifest);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('dash');
    });
  });
});

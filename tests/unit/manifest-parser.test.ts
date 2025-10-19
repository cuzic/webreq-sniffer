/**
 * Unit Tests for Manifest Parser
 */

import { describe, it, expect } from 'vitest';
import {
  parseHLSManifest,
  parseDASHManifest,
  detectManifestType,
  isMasterPlaylist,
} from '@/lib/manifest-parser';

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

  describe('isMasterPlaylist', () => {
    describe('HLS', () => {
      it('should identify master playlist with EXT-X-STREAM-INF', () => {
        const masterPlaylist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=1280x720
720p.m3u8`;

        expect(isMasterPlaylist(masterPlaylist, 'hls')).toBe(true);
      });

      it('should identify media playlist without EXT-X-STREAM-INF', () => {
        const mediaPlaylist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:9.9,
segment001.ts
#EXTINF:9.9,
segment002.ts`;

        expect(isMasterPlaylist(mediaPlaylist, 'hls')).toBe(false);
      });

      it('should return false for empty HLS content', () => {
        expect(isMasterPlaylist('', 'hls')).toBe(false);
        expect(isMasterPlaylist('#EXTM3U', 'hls')).toBe(false);
      });

      it('should handle mixed content (master with segments)', () => {
        // In practice, master playlists should not have segments
        // but we should still identify it as master if EXT-X-STREAM-INF is present
        const mixedContent = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=800000
variant.m3u8
#EXTINF:10.0,
segment.ts`;

        expect(isMasterPlaylist(mixedContent, 'hls')).toBe(true);
      });
    });

    describe('DASH', () => {
      it('should identify master MPD with Representation elements', () => {
        const masterMPD = `<?xml version="1.0"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
  <Period>
    <AdaptationSet>
      <Representation id="1" bandwidth="800000">
      </Representation>
      <Representation id="2" bandwidth="1400000">
      </Representation>
    </AdaptationSet>
  </Period>
</MPD>`;

        expect(isMasterPlaylist(masterMPD, 'dash')).toBe(true);
      });

      it('should return false for MPD without Representation elements', () => {
        const incompleteMPD = `<?xml version="1.0"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
  <Period>
  </Period>
</MPD>`;

        expect(isMasterPlaylist(incompleteMPD, 'dash')).toBe(false);
      });

      it('should return false for invalid XML', () => {
        expect(isMasterPlaylist('not valid xml', 'dash')).toBe(false);
      });

      it('should return false for empty DASH content', () => {
        expect(isMasterPlaylist('', 'dash')).toBe(false);
      });

      it('should handle MPD with AdaptationSet but no Representation', () => {
        const mpdWithoutRepresentation = `<?xml version="1.0"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
  <Period>
    <AdaptationSet mimeType="video/mp4">
    </AdaptationSet>
  </Period>
</MPD>`;

        expect(isMasterPlaylist(mpdWithoutRepresentation, 'dash')).toBe(false);
      });
    });

    describe('Unknown type', () => {
      it('should return false for unknown manifest types', () => {
        expect(isMasterPlaylist('any content', 'unknown' as any)).toBe(false);
        expect(isMasterPlaylist('#EXTM3U', null as any)).toBe(false);
      });
    });
  });
});

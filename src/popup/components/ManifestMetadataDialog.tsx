/**
 * Manifest Metadata Dialog
 * Displays parsed manifest information (variants, resolutions, codecs, etc.)
 */

import { useState, useEffect } from 'react';
import type { ManifestMetadata } from '@/types';
import { fetchAndParseManifest } from '@/lib/manifest-parser';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface ManifestMetadataDialogProps {
  url: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManifestMetadataDialog({ url, open, onOpenChange }: ManifestMetadataDialogProps) {
  const [metadata, setMetadata] = useState<ManifestMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch manifest metadata when dialog opens or URL changes
  useEffect(() => {
    if (!open || !url) {
      return;
    }

    setLoading(true);
    setError(null);
    setMetadata(null);

    fetchAndParseManifest(url)
      .then((data) => {
        setMetadata(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });
  }, [url, open]);

  // Extract filename from URL for display
  const filename = url.split('/').pop() || url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manifest Metadata</DialogTitle>
          <DialogDescription className="font-mono text-xs break-all">{filename}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading manifest...</span>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
              <p className="font-semibold">Error loading manifest</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && !metadata && (
            <div className="rounded-md bg-muted p-4 text-muted-foreground">
              <p>No metadata available for this manifest.</p>
            </div>
          )}

          {!loading && !error && metadata && (
            <>
              {/* Manifest Type */}
              <div>
                <h3 className="font-semibold mb-2">Type</h3>
                <p className="text-sm">
                  {metadata.type === 'hls' ? 'HLS (HTTP Live Streaming)' : 'DASH (MPEG-DASH)'}
                </p>
              </div>

              {/* Title */}
              {metadata.title && (
                <div>
                  <h3 className="font-semibold mb-2">Title</h3>
                  <p className="text-sm">{metadata.title}</p>
                </div>
              )}

              {/* HLS-specific: Target Duration */}
              {metadata.type === 'hls' && metadata.targetDuration && (
                <div>
                  <h3 className="font-semibold mb-2">Target Duration</h3>
                  <p className="text-sm">{metadata.targetDuration} seconds</p>
                </div>
              )}

              {/* DASH-specific: Segment Pattern */}
              {metadata.type === 'dash' && metadata.segmentPattern && (
                <div>
                  <h3 className="font-semibold mb-2">Segment Pattern</h3>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {metadata.segmentPattern}
                  </p>
                </div>
              )}

              {/* Stream Variants */}
              {metadata.variants && metadata.variants.length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-2">
                    Stream Variants ({metadata.variants.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-left">Quality</th>
                          <th className="px-3 py-2 text-left">Resolution</th>
                          <th className="px-3 py-2 text-left">Bitrate</th>
                          <th className="px-3 py-2 text-left">Codecs</th>
                          <th className="px-3 py-2 text-left">FPS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metadata.variants.map((variant, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-3 py-2">{variant.label || '—'}</td>
                            <td className="px-3 py-2 font-mono">{variant.resolution || '—'}</td>
                            <td className="px-3 py-2">
                              {variant.bandwidth
                                ? `${(variant.bandwidth / 1000000).toFixed(1)} Mbps`
                                : '—'}
                            </td>
                            <td className="px-3 py-2 font-mono text-xs">{variant.codecs || '—'}</td>
                            <td className="px-3 py-2">
                              {variant.frameRate ? `${variant.frameRate} fps` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-muted p-4 text-muted-foreground text-sm">
                  <p>No variant streams found. This may be a media playlist.</p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Template Evaluation Preview Component
 * Shows real-time preview of filename template evaluation with sample data
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateFilename } from '@/background/export';
import type { ExportFormat } from '@/types';
import type { TemplateContext } from '@/lib/template-evaluator';

interface TemplateEvaluationPreviewProps {
  template: string;
  format: ExportFormat;
}

export function TemplateEvaluationPreview({ template, format }: TemplateEvaluationPreviewProps) {
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Sample context for preview
  const sampleContext: TemplateContext = {
    // Page metadata
    pageTitle: 'Sample Video Page - Awesome Site',
    ogTitle: 'Sample Video Title',
    videoTitle: 'How to Use Chrome Extensions - Episode 1',
    metaTitle: 'Sample Meta Title',
    metaDescription: 'This is a sample description for the video',

    // Manifest metadata
    manifestTitle: 'HLS Stream Title',
    manifestType: 'hls',
    segmentPattern: 'segment-*.ts',
    programDate: '2025-10-18',

    // System variables
    date: '2025-10-18',
    time: '14-30-45',
    timestamp: 1729259445000,
    domain: 'example.com',
    ext: 'sh',
  };

  useEffect(() => {
    try {
      // Create a mock log entry with sample metadata
      const mockEntry = {
        url: 'https://example.com/video/playlist.m3u8',
        method: 'GET' as const,
        timestamp: Date.now(),
        tabId: 1,
        pageMetadata: {
          pageTitle: sampleContext.pageTitle,
          ogTitle: sampleContext.ogTitle,
          videoTitle: sampleContext.videoTitle,
          metaTitle: sampleContext.metaTitle,
          metaDescription: sampleContext.metaDescription,
          manifestMetadata: sampleContext.manifestTitle
            ? {
                type: sampleContext.manifestType as 'hls' | 'dash',
                title: sampleContext.manifestTitle,
                segmentPattern: sampleContext.segmentPattern,
                programDateTime: sampleContext.programDate
                  ? new Date(sampleContext.programDate).toISOString()
                  : undefined,
              }
            : undefined,
        },
      };

      const result = generateFilename(template, format, [mockEntry]);
      setPreview(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPreview('');
    }
  }, [template, format, sampleContext]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filename Preview</CardTitle>
        <CardDescription>
          Preview with sample data - actual values will vary based on page metadata
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription className="font-mono text-sm">{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <div className="font-mono text-sm break-all">{preview}</div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-semibold">Sample Data Used:</p>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>videoTitle:</div>
                <div className="truncate">{sampleContext.videoTitle}</div>

                <div>pageTitle:</div>
                <div className="truncate">{sampleContext.pageTitle}</div>

                <div>manifestType:</div>
                <div>{sampleContext.manifestType}</div>

                <div>date:</div>
                <div>{sampleContext.date}</div>

                <div>domain:</div>
                <div>{sampleContext.domain}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * TemplatePreview Component
 * Shows real-time preview of template output
 */

import type { LogEntry } from '@/types';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Loader2 } from 'lucide-react';
import { renderTemplate, validateTemplate } from '@/lib/mustache-template';

interface TemplatePreviewProps {
  template: string;
  entries: LogEntry[];
  loading?: boolean;
}

export function TemplatePreview({ template, entries, loading = false }: TemplatePreviewProps) {
  const [preview, setPreview] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate template first
    const validation = validateTemplate(template);
    if (!validation.valid) {
      setError(validation.error || 'Invalid template');
      setPreview('');
      return;
    }

    try {
      // Use first 3 entries for preview
      const previewEntries = entries.slice(0, 3);
      if (previewEntries.length === 0) {
        setPreview(
          '// No log entries available for preview\n// Start monitoring to capture requests'
        );
        setError(null);
        return;
      }

      const output = renderTemplate(template, previewEntries);
      setPreview(output);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Template rendering failed');
      setPreview('');
    }
  }, [template, entries]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview Output</CardTitle>
          <CardDescription>テンプレートのプレビューを生成中...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview Output</CardTitle>
        <CardDescription>
          {entries.length > 0
            ? `最初の${Math.min(3, entries.length)}エントリでプレビュー（全${entries.length}エントリ）`
            : 'ログエントリがありません'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Template Error</AlertTitle>
            <AlertDescription className="font-mono text-xs mt-2">{error}</AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[400px] w-full rounded border">
            <pre className="text-xs font-mono p-4 whitespace-pre-wrap break-all">{preview}</pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

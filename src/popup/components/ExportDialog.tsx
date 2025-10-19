/**
 * Export Dialog Component
 * Shows export preview before downloading
 */

import { useState, useEffect } from 'react';
import type { ExportFormat, LogEntry } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateExportContent } from '@/lib/export';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EXPORT_PREVIEW } from '@/lib/constants';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  format: ExportFormat;
  entries: LogEntry[];
  onConfirm: () => void;
}

export function ExportDialog({
  open,
  onOpenChange,
  format,
  entries,
  onConfirm,
}: ExportDialogProps) {
  const [preview, setPreview] = useState<string>('');
  const [expanded, setExpanded] = useState(false);
  const [previewEntries, setPreviewEntries] = useState<LogEntry[]>([]);

  // Generate preview when dialog opens or format changes
  useEffect(() => {
    if (open && entries.length > 0) {
      // Use first N entries for preview
      const previewCount = Math.min(EXPORT_PREVIEW.ENTRY_COUNT, entries.length);
      const entriesToPreview = entries.slice(0, previewCount);
      setPreviewEntries(entriesToPreview);

      // Generate preview asynchronously
      (async () => {
        try {
          const content = await generateExportContent(entriesToPreview, format);
          setPreview(content);
        } catch (error) {
          console.error('Failed to generate preview:', error);
          setPreview('プレビューの生成に失敗しました');
        }
      })();
    }
  }, [open, format, entries]);

  // Format labels
  const formatLabels: Record<ExportFormat, string> = {
    'url-list': 'URL List (.txt)',
    'bash-curl': 'Bash curl (.sh)',
    'bash-curl-headers': 'Bash curl with headers (.sh)',
    'bash-yt-dlp': 'Bash yt-dlp (.sh)',
    'bash-yt-dlp-cookies': 'Bash yt-dlp with cookies (.sh)',
    'bash-batch-download': 'Bash Batch Download (HLS/DASH) (.sh)',
    powershell: 'PowerShell (.ps1)',
    'powershell-batch-download': 'PowerShell Batch Download (HLS/DASH) (.ps1)',
    json: 'JSON (.json)',
  };

  const formatLabel = formatLabels[format] || format;

  // Calculate preview lines
  const previewLines = preview.split('\n');
  const displayedLines = expanded ? previewLines : previewLines.slice(0, EXPORT_PREVIEW.LINE_LIMIT);
  const hasMoreLines = previewLines.length > EXPORT_PREVIEW.LINE_LIMIT;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>エクスポートプレビュー</DialogTitle>
          <DialogDescription>
            {formatLabel} • {entries.length}件のエントリー
            {previewEntries.length < entries.length && ` (最初の${previewEntries.length}件を表示)`}
          </DialogDescription>
        </DialogHeader>

        {/* Preview */}
        <div className="space-y-2">
          <div className="text-sm font-medium">プレビュー:</div>
          <ScrollArea className="h-[300px] w-full rounded-md border bg-muted/50">
            <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all">
              {displayedLines.join('\n')}
            </pre>
          </ScrollArea>

          {/* Expand/Collapse button */}
          {hasMoreLines && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full"
            >
              {expanded ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  一部を表示
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  すべて表示 ({previewLines.length}行)
                </>
              )}
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-sm text-muted-foreground">
          {entries.length > previewEntries.length && (
            <p>
              実際のエクスポートには全{entries.length}
              件のエントリーが含まれます。
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={onConfirm}>エクスポート</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

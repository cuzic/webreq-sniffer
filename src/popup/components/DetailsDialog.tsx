/**
 * DetailsDialog Component
 * Shows detailed information about a log entry
 */

import type { LogEntry } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DetailsDialogProps {
  entry: LogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetailsDialog({ entry, open, onOpenChange }: DetailsDialogProps) {
  if (!entry) return null;

  const url = new URL(entry.url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>リクエスト詳細</DialogTitle>
          <DialogDescription>{new Date(entry.timestamp).toLocaleString('ja-JP')}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {/* URL */}
            <div>
              <Label className="text-xs text-muted-foreground">URL</Label>
              <p className="text-sm break-all font-mono bg-muted p-2 rounded mt-1">{entry.url}</p>
            </div>

            {/* Domain and Path */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Domain</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{url.hostname}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Path</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
                  {url.pathname}
                </p>
              </div>
            </div>

            {/* Method and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Method</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{entry.method}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{entry.type}</p>
              </div>
            </div>

            {/* Tab ID */}
            <div>
              <Label className="text-xs text-muted-foreground">Tab ID</Label>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{entry.tabId}</p>
            </div>

            {/* Request Headers */}
            {entry.requestHeaders && entry.requestHeaders.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Request Headers</Label>
                <ScrollArea className="h-[200px] mt-1">
                  <pre className="text-xs bg-muted p-3 rounded font-mono">
                    {entry.requestHeaders.map((h) => `${h.name}: ${h.value}`).join('\n')}
                  </pre>
                </ScrollArea>
              </div>
            )}

            {/* Response Headers */}
            {entry.responseHeaders && entry.responseHeaders.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Response Headers</Label>
                <ScrollArea className="h-[200px] mt-1">
                  <pre className="text-xs bg-muted p-3 rounded font-mono">
                    {entry.responseHeaders.map((h) => `${h.name}: ${h.value}`).join('\n')}
                  </pre>
                </ScrollArea>
              </div>
            )}

            {/* Metadata */}
            <div>
              <Label className="text-xs text-muted-foreground">Metadata</Label>
              <pre className="text-xs bg-muted p-3 rounded mt-1 font-mono">
                {JSON.stringify(
                  {
                    id: entry.id,
                    timestamp: entry.timestamp,
                    tabId: entry.tabId,
                    method: entry.method,
                    type: entry.type,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

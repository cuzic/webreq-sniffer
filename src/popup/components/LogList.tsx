/**
 * LogList Component
 * Displays list of captured log entries
 */

import type { LogEntry } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogListProps {
  entries: LogEntry[];
}

export function LogList({ entries }: LogListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>キャプチャされたリクエストがありません</p>
        <p className="text-sm mt-2">監視を開始してリクエストをキャプチャしてください</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border">
      <div className="p-4 space-y-2">
        {entries.map((entry) => (
          <LogEntryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </ScrollArea>
  );
}

interface LogEntryItemProps {
  entry: LogEntry;
}

function LogEntryItem({ entry }: LogEntryItemProps) {
  // Extract domain from URL
  let domain = '';
  let path = entry.url;
  try {
    const url = new URL(entry.url);
    domain = url.hostname;
    path = url.pathname + url.search;
  } catch {
    // Invalid URL, use as-is
  }

  return (
    <div className="group rounded-lg border p-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Domain */}
          {domain && <div className="text-xs text-muted-foreground font-medium mb-1">{domain}</div>}

          {/* Path/URL */}
          <div className="text-sm font-mono break-all">{path || entry.url}</div>

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="font-semibold">{entry.method}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span>{entry.type}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              {new Date(entry.timestamp).toLocaleTimeString('ja-JP')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

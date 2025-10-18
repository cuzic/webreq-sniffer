/**
 * LogList Component
 * Displays list of captured log entries
 */

import type { LogEntry } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { LogEntryActions } from './LogEntryActions';

interface LogListProps {
  entries: LogEntry[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onCopyUrl: (entry: LogEntry) => void;
  onOpenInTab: (entry: LogEntry) => void;
  onExport: (entry: LogEntry) => void;
  onShowDetails: (entry: LogEntry) => void;
}

export function LogList({
  entries,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
  onCopyUrl,
  onOpenInTab,
  onExport,
  onShowDetails,
}: LogListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>キャプチャされたリクエストがありません</p>
        <p className="text-sm mt-2">監視を開始してリクエストをキャプチャしてください</p>
      </div>
    );
  }

  const allSelected = entries.length > 0 && entries.every((entry) => selectedIds.has(entry.id));

  return (
    <div className="space-y-3">
      {/* Selection controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectAll();
              } else {
                onClearAll();
              }
            }}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            すべて選択
          </label>
        </div>
        <div className="text-sm text-muted-foreground">
          選択: {selectedIds.size}/{entries.length}件
        </div>
      </div>

      {/* Log entries */}
      <ScrollArea className="h-[300px] w-full rounded-md border">
        <div className="p-4 space-y-2">
          {entries.map((entry) => (
            <LogEntryItem
              key={entry.id}
              entry={entry}
              selected={selectedIds.has(entry.id)}
              onToggle={() => onToggle(entry.id)}
              onCopyUrl={onCopyUrl}
              onOpenInTab={onOpenInTab}
              onExport={onExport}
              onShowDetails={onShowDetails}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface LogEntryItemProps {
  entry: LogEntry;
  selected: boolean;
  onToggle: () => void;
  onCopyUrl: (entry: LogEntry) => void;
  onOpenInTab: (entry: LogEntry) => void;
  onExport: (entry: LogEntry) => void;
  onShowDetails: (entry: LogEntry) => void;
}

function LogEntryItem({
  entry,
  selected,
  onToggle,
  onCopyUrl,
  onOpenInTab,
  onExport,
  onShowDetails,
}: LogEntryItemProps) {
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
    <div
      className={`group rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
        selected ? 'bg-muted/50 border-primary' : ''
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />

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

        {/* Action buttons */}
        <LogEntryActions
          entry={entry}
          onCopyUrl={onCopyUrl}
          onOpenInTab={onOpenInTab}
          onExport={onExport}
          onShowDetails={onShowDetails}
        />
      </div>
    </div>
  );
}

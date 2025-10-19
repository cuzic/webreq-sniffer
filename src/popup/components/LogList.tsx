/**
 * LogList Component
 * Displays list of captured log entries
 */

import { useMemo, memo } from 'react';
import type { LogEntry, SelectionActions, EntryActions } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { LogEntryActions } from './LogEntryActions';
import { getTypeColor, getTypeBadgeColor, getTypeIcon, getTypeDisplayName } from '@/lib/ui-helpers';

interface LogListProps {
  entries: LogEntry[];
  selectedIds: Set<string>;
  selectionActions: SelectionActions;
  entryActions: EntryActions;
}

export function LogList({ entries, selectedIds, selectionActions, entryActions }: LogListProps) {
  const { onToggle, onSelectAll, onClearAll, onInvertSelection } = selectionActions;
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>キャプチャされたリクエストがありません</p>
        <p className="text-sm mt-2">監視を開始してリクエストをキャプチャしてください</p>
      </div>
    );
  }

  // Memoize expensive calculation
  const allSelected = useMemo(
    () => entries.length > 0 && entries.every((entry) => selectedIds.has(entry.id)),
    [entries, selectedIds]
  );

  return (
    <div className="space-y-3">
      {/* Selection controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
          <button
            onClick={onInvertSelection}
            className="text-sm text-primary hover:underline cursor-pointer"
          >
            選択を反転
          </button>
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
              entryActions={entryActions}
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
  entryActions: EntryActions;
}

const LogEntryItem = memo(function LogEntryItem({
  entry,
  selected,
  onToggle,
  entryActions,
}: LogEntryItemProps) {
  // Extract domain from URL (memoized)
  const { domain, path } = useMemo(() => {
    try {
      const url = new URL(entry.url);
      return {
        domain: url.hostname,
        path: url.pathname + url.search,
      };
    } catch {
      // Invalid URL, use as-is
      return { domain: '', path: entry.url };
    }
  }, [entry.url]);

  // Memoize UI helper calls
  const typeColorClass = useMemo(() => getTypeColor(entry.type), [entry.type]);
  const typeBadgeClass = useMemo(() => getTypeBadgeColor(entry.type), [entry.type]);
  const typeIcon = useMemo(() => getTypeIcon(entry.type), [entry.type]);
  const typeDisplay = useMemo(() => getTypeDisplayName(entry.type), [entry.type]);

  return (
    <div
      className={`group rounded-lg border p-3 transition-colors cursor-pointer ${
        selected ? 'border-primary ring-2 ring-primary/20' : typeColorClass
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
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="font-semibold text-muted-foreground">{entry.method}</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeBadgeClass}`}
            >
              <span>{typeIcon}</span>
              <span>{typeDisplay}</span>
            </span>
            <span className="text-muted-foreground">
              {new Date(entry.timestamp).toLocaleTimeString('ja-JP')}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <LogEntryActions entry={entry} actions={entryActions} />
      </div>
    </div>
  );
});

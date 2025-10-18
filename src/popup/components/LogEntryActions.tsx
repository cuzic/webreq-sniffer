/**
 * LogEntryActions Component
 * Quick action buttons for log entries
 */

import type { LogEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Download, Info } from 'lucide-react';

interface LogEntryActionsProps {
  entry: LogEntry;
  onCopyUrl: (entry: LogEntry) => void;
  onOpenInTab: (entry: LogEntry) => void;
  onExport: (entry: LogEntry) => void;
  onShowDetails: (entry: LogEntry) => void;
}

export function LogEntryActions({
  entry,
  onCopyUrl,
  onOpenInTab,
  onExport,
  onShowDetails,
}: LogEntryActionsProps) {
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent row selection toggle
    action();
  };

  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={(e) => handleAction(e, () => onCopyUrl(entry))}
        title="URLをコピー"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={(e) => handleAction(e, () => onOpenInTab(entry))}
        title="新しいタブで開く"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={(e) => handleAction(e, () => onExport(entry))}
        title="エクスポート"
      >
        <Download className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={(e) => handleAction(e, () => onShowDetails(entry))}
        title="詳細を表示"
      >
        <Info className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

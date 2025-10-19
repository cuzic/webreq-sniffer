/**
 * LogEntryActions Component
 * Quick action buttons for log entries
 */

import type { LogEntry, EntryActions } from '@/types';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Download, Info, Trash2, ChevronDown, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { detectManifestType } from '@/lib/manifest-parser';

interface LogEntryActionsProps {
  entry: LogEntry;
  actions: EntryActions;
}

export function LogEntryActions({ entry, actions }: LogEntryActionsProps) {
  const {
    onCopyUrl,
    onOpenInTab,
    onExport,
    onShowDetails,
    onDelete,
    onCopyCurl,
    onCopyCurlWithHeaders,
    onCopyYtDlp,
    onViewManifestMetadata,
  } = actions;
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent row selection toggle
    action();
  };

  const isManifest = detectManifestType(entry.url) !== null;

  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Copy Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-1.5"
            onClick={(e) => e.stopPropagation()}
            title="コピーオプション"
          >
            <Copy className="h-3.5 w-3.5 mr-0.5" />
            <ChevronDown className="h-2.5 w-2.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => onCopyUrl(entry)}>URLをコピー</DropdownMenuItem>
          {onCopyCurl && (
            <DropdownMenuItem onClick={() => onCopyCurl(entry)}>
              curl コマンドをコピー
            </DropdownMenuItem>
          )}
          {onCopyCurlWithHeaders && (
            <DropdownMenuItem onClick={() => onCopyCurlWithHeaders(entry)}>
              curl（ヘッダー付き）をコピー
            </DropdownMenuItem>
          )}
          {onCopyYtDlp && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onCopyYtDlp(entry)}>
                yt-dlp コマンドをコピー
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Other Actions */}
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
      {isManifest && onViewManifestMetadata && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={(e) => handleAction(e, () => onViewManifestMetadata(entry))}
          title="マニフェストメタデータを表示"
        >
          <FileText className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={(e) => handleAction(e, () => onShowDetails(entry))}
        title="詳細を表示"
      >
        <Info className="h-3.5 w-3.5" />
      </Button>
      {onDelete && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          onClick={(e) => handleAction(e, () => onDelete(entry))}
          title="削除"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

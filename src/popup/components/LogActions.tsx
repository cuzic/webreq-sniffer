/**
 * Log Actions Component
 * Export and clear log actions
 */

import { useState } from 'react';
import type { ExportFormat, LogEntry } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Download, Trash2 } from 'lucide-react';
import { ExportDialog } from './ExportDialog';

interface LogActionsProps {
  entryCount: number;
  selectedCount: number;
  entries: LogEntry[];
  onExport: (format: ExportFormat) => void;
  onClear: () => void;
}

export function LogActions({
  entryCount,
  selectedCount,
  entries,
  onExport,
  onClear,
}: LogActionsProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('bash-curl');

  const hasEntries = entryCount > 0;
  const exportLabel =
    selectedCount > 0 ? `選択をダウンロード (${selectedCount}件)` : 'ログをダウンロード';

  function handleFormatSelect(format: ExportFormat) {
    setSelectedFormat(format);
    setExportDialogOpen(true);
  }

  function handleExportConfirm() {
    setExportDialogOpen(false);
    onExport(selectedFormat);
  }

  return (
    <div className="space-y-3">
      {/* Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full" disabled={!hasEntries}>
            <Download className="mr-2 h-4 w-4" />
            {exportLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onClick={() => handleFormatSelect('url-list')}>
            URL List (.txt)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFormatSelect('bash-curl')}>
            Bash curl (.sh)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFormatSelect('bash-curl-headers')}>
            Bash curl with headers (.sh)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFormatSelect('bash-yt-dlp')}>
            Bash yt-dlp (.sh)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFormatSelect('bash-batch-download')}>
            Bash Batch Download (.sh)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFormatSelect('powershell')}>
            PowerShell (.ps1)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFormatSelect('powershell-batch-download')}>
            PowerShell Batch Download (.ps1)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Preview Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        format={selectedFormat}
        entries={entries}
        onConfirm={handleExportConfirm}
      />

      {/* Clear Button with Confirmation */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full" disabled={!hasEntries}>
            <Trash2 className="mr-2 h-4 w-4" />
            ログをクリア
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ログをクリアしますか？</AlertDialogTitle>
            <AlertDialogDescription>
              すべてのログエントリ（{entryCount}件）が削除されます。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={onClear}>クリア</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

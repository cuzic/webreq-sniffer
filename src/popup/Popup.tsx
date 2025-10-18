/**
 * Main Popup Component
 * User interface for WebreqSniffer extension
 */

import { useEffect, useState } from 'react';
import type { ExportFormat } from '@/types';
import {
  startMonitoring,
  stopMonitoring,
  getStatus,
  clearLogs,
  exportLogs,
  openOptionsPage,
} from './messaging';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Play, Square, Download, Trash2, Settings } from 'lucide-react';

interface Status {
  isMonitoring: boolean;
  monitoringScope: 'activeTab' | 'allTabs';
  entryCount: number;
}

export function Popup() {
  const [status, setStatus] = useState<Status>({
    isMonitoring: false,
    monitoringScope: 'activeTab',
    entryCount: 0,
  });
  const [loading, setLoading] = useState(false);

  // Load status on mount and set up refresh interval
  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 1000); // Refresh every second
    return () => clearInterval(interval);
  }, []);

  async function loadStatus() {
    try {
      const result = await getStatus();
      setStatus({
        isMonitoring: result.isMonitoring,
        monitoringScope: result.monitoringScope,
        entryCount: result.entryCount,
      });
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  }

  async function handleStartStop() {
    setLoading(true);
    try {
      if (status.isMonitoring) {
        await stopMonitoring();
      } else {
        await startMonitoring(status.monitoringScope);
      }
      await loadStatus();
    } catch (error) {
      console.error('Failed to start/stop monitoring:', error);
      alert(`Failed to ${status.isMonitoring ? 'stop' : 'start'} monitoring: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleScopeChange(checked: boolean) {
    const newScope = checked ? 'allTabs' : 'activeTab';
    setStatus((prev) => ({ ...prev, monitoringScope: newScope }));

    // If currently monitoring, restart with new scope
    if (status.isMonitoring) {
      setLoading(true);
      try {
        await stopMonitoring();
        await startMonitoring(newScope);
        await loadStatus();
      } catch (error) {
        console.error('Failed to change scope:', error);
        alert(`Failed to change monitoring scope: ${error}`);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleExport(format: ExportFormat) {
    if (status.entryCount === 0) {
      alert('No logs to export');
      return;
    }

    setLoading(true);
    try {
      const result = await exportLogs(format);
      console.log('Exported:', result.filename);
    } catch (error) {
      console.error('Failed to export:', error);
      alert(`Failed to export logs: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setLoading(true);
    try {
      await clearLogs();
      await loadStatus();
    } catch (error) {
      console.error('Failed to clear logs:', error);
      alert(`Failed to clear logs: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  const exportFormats: Array<{ label: string; value: ExportFormat }> = [
    { label: 'URL List (.txt)', value: 'url-list' },
    { label: 'Bash (curl)', value: 'bash-curl' },
    { label: 'Bash (curl + Headers)', value: 'bash-curl-headers' },
    { label: 'Bash (yt-dlp)', value: 'bash-yt-dlp' },
    { label: 'PowerShell (.ps1)', value: 'powershell' },
  ];

  return (
    <div className="min-w-[400px] min-h-[500px] p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800">WebreqSniffer</h1>
          <Button variant="ghost" size="icon" onClick={openOptionsPage} title="設定">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              status.isMonitoring ? 'bg-red-500' : 'bg-gray-300'
            }`}
          />
          <span className="text-sm font-medium text-gray-700">
            {status.isMonitoring ? '● 監視中' : '◯ 停止中'}
          </span>
          {status.isMonitoring && (
            <span className="text-xs text-gray-500">
              ({status.monitoringScope === 'activeTab' ? 'アクティブタブ' : 'すべてのタブ'})
            </span>
          )}
        </div>
      </div>

      {/* Monitoring Controls */}
      <div className="space-y-4 mb-6">
        <div>
          <Button
            onClick={handleStartStop}
            disabled={loading}
            className="w-full"
            variant={status.isMonitoring ? 'destructive' : 'default'}
          >
            {status.isMonitoring ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                監視ストップ
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                監視スタート
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <Label htmlFor="scope-switch" className="text-sm font-medium">
            監視範囲
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {status.monitoringScope === 'activeTab' ? 'アクティブタブのみ' : 'すべてのタブ'}
            </span>
            <Switch
              id="scope-switch"
              checked={status.monitoringScope === 'allTabs'}
              onCheckedChange={handleScopeChange}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Data Operations */}
      <div className="space-y-3 mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              disabled={status.entryCount === 0 || loading}
            >
              <Download className="mr-2 h-4 w-4" />
              ログをダウンロード
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[360px]">
            {exportFormats.map((format) => (
              <DropdownMenuItem key={format.value} onClick={() => handleExport(format.value)}>
                {format.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              disabled={status.entryCount === 0 || loading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              ログをクリア
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ログをクリアしますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は元に戻せません。{status.entryCount}件のログが削除されます。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction onClick={handleClear}>クリア</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Info Area */}
      <div className="p-4 bg-white rounded-lg border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">ログ件数</span>
          <span className="text-lg font-bold text-gray-900">
            {status.entryCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Popup Component
 * User interface for WebreqSniffer extension
 */

import { useEffect, useState, useMemo } from 'react';
import type { ExportFormat, LogEntry } from '@/types';
import {
  startMonitoring,
  stopMonitoring,
  getStatus,
  clearLogs,
  exportLogs,
  openOptionsPage,
} from './messaging';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { MonitoringControl } from './components/MonitoringControl';
import { LogActions } from './components/LogActions';
import { SearchBar } from './components/SearchBar';
import { FilterDropdown } from './components/FilterDropdown';
import { LogList } from './components/LogList';
import { DetailsDialog } from './components/DetailsDialog';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface Status {
  isMonitoring: boolean;
  monitoringScope: 'activeTab' | 'allTabs';
  entryCount: number;
  entries: LogEntry[];
}

export function Popup() {
  const [status, setStatus] = useState<Status>({
    isMonitoring: false,
    monitoringScope: 'activeTab',
    entryCount: 0,
    entries: [],
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailsEntry, setDetailsEntry] = useState<LogEntry | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

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
        entries: result.entries,
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
    setLoading(true);
    try {
      // Export selected entries if any are selected, otherwise export all
      const idsToExport = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;
      const filename = await exportLogs(format, idsToExport);
      alert(`Exported to ${filename}`);
    } catch (error) {
      console.error('Failed to export logs:', error);
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

  // Filter entries based on search term and filter type
  const filteredEntries = useMemo(() => {
    return status.entries.filter((entry) => {
      // Search term filter
      if (searchTerm && !entry.url.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Resource type filter
      if (filterType !== 'all' && entry.type !== filterType) {
        return false;
      }

      return true;
    });
  }, [status.entries, searchTerm, filterType]);

  // Selection handlers
  function handleToggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSelectAll() {
    setSelectedIds(new Set(filteredEntries.map((e) => e.id)));
  }

  function handleClearAll() {
    setSelectedIds(new Set());
  }

  // Quick action handlers
  async function handleCopyUrl(entry: LogEntry) {
    try {
      await navigator.clipboard.writeText(entry.url);
      toast.success('URLをコピーしました');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('URLのコピーに失敗しました');
    }
  }

  function handleOpenInTab(entry: LogEntry) {
    try {
      chrome.tabs.create({ url: entry.url });
      toast.success('新しいタブで開きました');
    } catch (error) {
      console.error('Failed to open URL:', error);
      toast.error('URLを開けませんでした');
    }
  }

  async function handleExportSingle(entry: LogEntry) {
    setLoading(true);
    try {
      const filename = await exportLogs('json', [entry.id]);
      toast.success(`${filename} をエクスポートしました`);
    } catch (error) {
      console.error('Failed to export entry:', error);
      toast.error('エクスポートに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function handleShowDetails(entry: LogEntry) {
    setDetailsEntry(entry);
    setShowDetailsDialog(true);
  }

  return (
    <div className="w-[400px] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">WebreqSniffer</h1>
        <Button variant="ghost" size="sm" onClick={openOptionsPage}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Monitoring Control */}
      <Card>
        <CardHeader>
          <CardTitle>モニタリング</CardTitle>
          <CardDescription>ネットワークリクエストの監視を開始</CardDescription>
        </CardHeader>
        <CardContent>
          <MonitoringControl
            isMonitoring={status.isMonitoring}
            monitoringScope={status.monitoringScope}
            loading={loading}
            onStartStop={handleStartStop}
            onScopeChange={handleScopeChange}
          />
        </CardContent>
      </Card>

      {/* Log Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>ログ件数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{status.entryCount.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground mt-1">
            キャプチャされたリクエスト
            {searchTerm || filterType !== 'all' ? (
              <span className="ml-2">（{filteredEntries.length}件を表示）</span>
            ) : null}
          </p>
        </CardContent>
      </Card>

      {/* Log Entries */}
      {status.entryCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ログエントリ</CardTitle>
            <CardDescription>キャプチャされたリクエストの一覧</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>
              <FilterDropdown value={filterType} onChange={setFilterType} />
            </div>

            {/* Log List */}
            <LogList
              entries={filteredEntries}
              selectedIds={selectedIds}
              onToggle={handleToggle}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
              onCopyUrl={handleCopyUrl}
              onOpenInTab={handleOpenInTab}
              onExport={handleExportSingle}
              onShowDetails={handleShowDetails}
            />
          </CardContent>
        </Card>
      )}

      {/* Log Actions */}
      <Card>
        <CardHeader>
          <CardTitle>アクション</CardTitle>
          <CardDescription>ログのエクスポートとクリア</CardDescription>
        </CardHeader>
        <CardContent>
          <LogActions
            entryCount={status.entryCount}
            selectedCount={selectedIds.size}
            onExport={handleExport}
            onClear={handleClear}
          />
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <DetailsDialog
        entry={detailsEntry}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

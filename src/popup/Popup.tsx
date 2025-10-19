/**
 * Main Popup Component
 * User interface for WebreqSniffer extension
 */

import { useState, useMemo, useEffect } from 'react';
import type { ExportFormat, LogEntry, Settings as SettingsType } from '@/types';
import { exportLogs, openOptionsPage } from './messaging';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { MonitoringControl } from './components/MonitoringControl';
import { LogActions } from './components/LogActions';
import { SearchBar } from './components/SearchBar';
import { FilterDropdown } from './components/FilterDropdown';
import { QuickFilters } from './components/QuickFilters';
import { FilterPreviewBadge } from './components/FilterPreviewBadge';
import { DuplicateControl } from './components/DuplicateControl';
import { LogList } from './components/LogList';
import { DetailsDialog } from './components/DetailsDialog';
import { Toaster } from '@/components/ui/sonner';
import { useMonitoring } from './hooks/useMonitoring';
import { useSelection } from './hooks/useSelection';
import { useEntryActions } from './hooks/useEntryActions';
import { applyPreset } from '@/lib/filter-presets';
import { defaultSettings } from '@/types/schemas';
import { Logger } from '@/lib/logger';
import { detectDuplicates, DuplicateStrategy } from '@/lib/duplicate-detector';

export function Popup() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [detailsEntry, setDetailsEntry] = useState<LogEntry | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>(
    DuplicateStrategy.KEEP_FIRST
  );

  // Custom hooks
  const monitoring = useMonitoring();
  const selection = useSelection(monitoring.status.entries);
  const entryActionsHook = useEntryActions(setDetailsEntry, setShowDetailsDialog);

  // Load settings on mount
  useEffect(() => {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        setSettings(result.settings);
      }
    });
  }, []);

  // Apply preset handler
  function handleApplyPreset(presetId: string) {
    try {
      const newSettings = applyPreset(presetId, settings);
      setSettings(newSettings);

      // Map preset to simple filterType for existing UI
      if (presetId === 'all') {
        setFilterType('all');
        setSearchTerm('');
      } else if (presetId === 'video') {
        setFilterType('media');
      } else if (presetId === 'images') {
        setFilterType('image');
      } else if (presetId === 'api') {
        setFilterType('xmlhttprequest');
      } else if (presetId === 'documents') {
        setFilterType('other');
      }
    } catch (error) {
      Logger.error('Popup', error, { presetId, context: 'applyPreset' });
    }
  }

  // Filter entries based on search term, filter type, and duplicate settings
  const filteredEntries = useMemo(() => {
    let entries = monitoring.status.entries.filter((entry) => {
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

    // Apply duplicate filtering if enabled
    if (showDuplicatesOnly) {
      const duplicates = detectDuplicates(entries);
      entries = entries.filter((entry) => duplicates[entry.id] !== undefined);
    }

    return entries;
  }, [monitoring.status.entries, searchTerm, filterType, showDuplicatesOnly]);

  async function handleExport(format: ExportFormat) {
    const loading = monitoring.loading || entryActionsHook.loading;
    if (loading) return;

    try {
      // Export selected entries if any are selected, otherwise export all
      const idsToExport =
        selection.selectedIds.size > 0 ? Array.from(selection.selectedIds) : undefined;
      const filename = await exportLogs(format, idsToExport);
      alert(`Exported to ${filename}`);
    } catch (error) {
      Logger.error('Popup', error, { format, context: 'export' });
      alert(`Failed to export logs: ${error}`);
    }
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
            isMonitoring={monitoring.status.isMonitoring}
            monitoringScope={monitoring.status.monitoringScope}
            loading={monitoring.loading}
            onStartStop={monitoring.handleStartStop}
            onScopeChange={monitoring.handleScopeChange}
          />
        </CardContent>
      </Card>

      {/* Log Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>ログ件数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{monitoring.status.entryCount.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground mt-1">
            キャプチャされたリクエスト
            {searchTerm || filterType !== 'all' ? (
              <span className="ml-2">（{filteredEntries.length}件を表示）</span>
            ) : null}
          </p>
        </CardContent>
      </Card>

      {/* Log Entries */}
      {monitoring.status.entryCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ログエントリ</CardTitle>
            <CardDescription>キャプチャされたリクエストの一覧</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Quick Filters */}
            <QuickFilters settings={settings} onApplyPreset={handleApplyPreset} />

            {/* Search and Filter */}
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>
              <FilterDropdown value={filterType} onChange={setFilterType} />
              <FilterPreviewBadge
                entries={monitoring.status.entries}
                searchTerm={searchTerm}
                filterType={filterType}
              />
            </div>

            {/* Duplicate Control */}
            <DuplicateControl
              entries={monitoring.status.entries}
              showDuplicatesOnly={showDuplicatesOnly}
              onToggleDuplicates={setShowDuplicatesOnly}
              duplicateStrategy={duplicateStrategy}
              onStrategyChange={setDuplicateStrategy}
            />

            {/* Log List */}
            <LogList
              entries={filteredEntries}
              selectedIds={selection.selectedIds}
              selectionActions={selection.selectionActions}
              entryActions={entryActionsHook.entryActions}
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
            entryCount={monitoring.status.entryCount}
            selectedCount={selection.selectedIds.size}
            entries={selection.entriesToExport}
            onExport={handleExport}
            onClear={monitoring.handleClear}
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

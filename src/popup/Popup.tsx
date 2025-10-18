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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { MonitoringControl } from './components/MonitoringControl';
import { LogActions } from './components/LogActions';

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
    setLoading(true);
    try {
      const filename = await exportLogs(format);
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
          <p className="text-sm text-muted-foreground mt-1">キャプチャされたリクエスト</p>
        </CardContent>
      </Card>

      {/* Log Actions */}
      <Card>
        <CardHeader>
          <CardTitle>アクション</CardTitle>
          <CardDescription>ログのエクスポートとクリア</CardDescription>
        </CardHeader>
        <CardContent>
          <LogActions
            entryCount={status.entryCount}
            onExport={handleExport}
            onClear={handleClear}
          />
        </CardContent>
      </Card>
    </div>
  );
}

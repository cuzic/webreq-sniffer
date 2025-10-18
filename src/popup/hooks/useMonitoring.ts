/**
 * useMonitoring Hook
 * Manages monitoring state and controls
 */

import { useEffect, useState } from 'react';
import type { LogEntry } from '@/types';
import { startMonitoring, stopMonitoring, getStatus, clearLogs } from '../messaging';
import { REFRESH_INTERVALS } from '@/lib/constants';

interface MonitoringStatus {
  isMonitoring: boolean;
  monitoringScope: 'activeTab' | 'allTabs';
  entryCount: number;
  entries: LogEntry[];
}

export function useMonitoring() {
  const [status, setStatus] = useState<MonitoringStatus>({
    isMonitoring: false,
    monitoringScope: 'activeTab',
    entryCount: 0,
    entries: [],
  });
  const [loading, setLoading] = useState(false);

  // Load status on mount and set up refresh interval
  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, REFRESH_INTERVALS.STATUS_POLLING);
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

  return {
    status,
    loading,
    handleStartStop,
    handleScopeChange,
    handleClear,
  };
}

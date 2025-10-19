/**
 * useMonitoring Hook
 * Manages monitoring state and controls
 */

import { useEffect, useState } from 'react';
import type { MonitoringStatus } from '@/types';
import { startMonitoring, stopMonitoring, getStatus, clearLogs } from '../messaging';
import { stateEmitter } from '@/lib/state-change-emitter';
import { Logger } from '@/lib/logger';

export function useMonitoring() {
  const [status, setStatus] = useState<MonitoringStatus>({
    isMonitoring: false,
    monitoringScope: 'activeTab',
    entryCount: 0,
    entries: [],
  });
  const [loading, setLoading] = useState(false);

  // Load status on mount and subscribe to real-time updates (Observer Pattern)
  useEffect(() => {
    loadStatus();

    // Subscribe to storage changes instead of polling
    const unsubscribe = stateEmitter.subscribe('logData:changed', () => {
      loadStatus();
    });

    return unsubscribe;
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
      Logger.error('useMonitoring', error, { context: 'loadStatus' });
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
      Logger.error('useMonitoring', error, {
        context: 'startStop',
        isMonitoring: status.isMonitoring,
      });
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
        Logger.error('useMonitoring', error, { context: 'scopeChange', scope: newScope });
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
      Logger.error('useMonitoring', error, { context: 'clearLogs' });
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

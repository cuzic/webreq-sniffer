/**
 * Monitoring Control Component
 * Start/stop monitoring and scope selection
 */

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Play, Square } from 'lucide-react';

interface MonitoringControlProps {
  isMonitoring: boolean;
  monitoringScope: 'activeTab' | 'allTabs';
  loading: boolean;
  onStartStop: () => void;
  onScopeChange: (allTabs: boolean) => void;
}

export function MonitoringControl({
  isMonitoring,
  monitoringScope,
  loading,
  onStartStop,
  onScopeChange,
}: MonitoringControlProps) {
  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`h-3 w-3 rounded-full ${isMonitoring ? 'bg-success animate-pulse' : 'bg-muted'}`}
          />
          <span className="font-medium">{isMonitoring ? '監視中' : '停止中'}</span>
        </div>
      </div>

      {/* Start/Stop Button */}
      <Button onClick={onStartStop} disabled={loading} className="w-full" size="lg">
        {isMonitoring ? (
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

      {/* Scope Toggle */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <Label htmlFor="scope-toggle" className="cursor-pointer">
          すべてのタブを監視
        </Label>
        <Switch
          id="scope-toggle"
          checked={monitoringScope === 'allTabs'}
          onCheckedChange={onScopeChange}
        />
      </div>
    </div>
  );
}

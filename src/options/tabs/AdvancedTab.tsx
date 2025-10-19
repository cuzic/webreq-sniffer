/**
 * Advanced Tab Component
 * Advanced settings and data management
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { defaultSettings } from '@/types/schemas';
import { useSettings } from '@/contexts/SettingsContext';

export function AdvancedTab() {
  const { settings, updateSettings } = useSettings();
  function handleExportSettings() {
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webreqsniffer-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        updateSettings(imported);
        alert('Settings imported successfully');
      } catch (error) {
        alert(`Failed to import settings: ${error}`);
      }
    };
    input.click();
  }

  function handleResetSettings() {
    if (confirm('すべての設定をデフォルトに戻しますか？')) {
      updateSettings(defaultSettings);
    }
  }

  return (
    <div className="space-y-6">
      {/* Settings Management */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Management</CardTitle>
          <CardDescription>Export, import, or reset your configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExportSettings} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Settings
            </Button>
            <Button onClick={handleImportSettings} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import Settings
            </Button>
            <Button onClick={handleResetSettings} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* UI Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>UI Preferences</CardTitle>
          <CardDescription>Customize the extension interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="show-badge"
              checked={settings.ui.showBadge}
              onCheckedChange={(checked) =>
                updateSettings({
                  ui: { ...settings.ui, showBadge: !!checked },
                })
              }
            />
            <Label htmlFor="show-badge" className="font-normal">
              <div className="font-medium">Show Badge Count</div>
              <p className="text-sm text-muted-foreground mt-1">
                Display the number of captured requests on the extension icon
              </p>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About WebreqSniffer</CardTitle>
          <CardDescription>Extension information</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium inline">Version:</dt>
              <dd className="inline ml-2">0.1.0</dd>
            </div>
            <div>
              <dt className="font-medium inline">Description:</dt>
              <dd className="inline ml-2">
                Monitor network requests and generate download scripts
              </dd>
            </div>
            <div>
              <dt className="font-medium inline">License:</dt>
              <dd className="inline ml-2">MIT</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

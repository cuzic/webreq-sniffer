/**
 * Options Page Component
 * Settings management for WebreqSniffer extension
 */

import { useEffect, useState } from 'react';
import type { Settings } from '@/types';
import { getSettings, updateSettings } from './messaging';
import { defaultSettings } from '@/types/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, RotateCcw, Download, Upload, AlertTriangle } from 'lucide-react';

const RESOURCE_TYPES = [
  { value: 'main_frame', label: 'Main Frame' },
  { value: 'sub_frame', label: 'Sub Frame' },
  { value: 'stylesheet', label: 'Stylesheet' },
  { value: 'script', label: 'Script' },
  { value: 'image', label: 'Image' },
  { value: 'font', label: 'Font' },
  { value: 'object', label: 'Object' },
  { value: 'xmlhttprequest', label: 'XHR' },
  { value: 'ping', label: 'Ping' },
  { value: 'csp_report', label: 'CSP Report' },
  { value: 'media', label: 'Media' },
  { value: 'websocket', label: 'WebSocket' },
  { value: 'webbundle', label: 'Web Bundle' },
  { value: 'other', label: 'Other' },
];

const PRESETS = {
  video: {
    name: '動画ストリーミング',
    simpleFilters: ['.m3u8', '.mpd', '.ts', '.m4s'],
    regexFilters: [],
    resourceTypes: ['media', 'xmlhttprequest', 'other'],
  },
  documents: {
    name: 'ドキュメント',
    simpleFilters: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    regexFilters: [],
    resourceTypes: ['main_frame', 'xmlhttprequest', 'other'],
  },
  images: {
    name: '画像',
    simpleFilters: [],
    regexFilters: [],
    resourceTypes: ['image'],
  },
};

export function Options() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const loaded = await getSettings();
      setSettings(loaded);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(`Failed to save settings: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    if (confirm('すべての設定をデフォルトに戻しますか？')) {
      setSettings(defaultSettings);
    }
  }

  function applyPreset(preset: keyof typeof PRESETS) {
    const p = PRESETS[preset];
    setSettings({
      ...settings,
      simpleFilters: p.simpleFilters,
      regexFilters: p.regexFilters,
      resourceTypes: p.resourceTypes,
    });
  }

  function handleExportSettings() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webreq-sniffer-settings.json';
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
        setSettings(imported);
      } catch (error) {
        alert(`Failed to import settings: ${error}`);
      }
    };
    input.click();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WebreqSniffer Settings</h1>
          <p className="text-gray-600">
            Configure filtering, collection policies, and export settings
          </p>
        </div>

        <Tabs defaultValue="filters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="policy">Collection Policy</TabsTrigger>
            <TabsTrigger value="limits">Limits & Export</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Filters Tab */}
          <TabsContent value="filters" className="space-y-6">
            {/* Presets */}
            <Card>
              <CardHeader>
                <CardTitle>Presets</CardTitle>
                <CardDescription>Quick filter presets for common use cases</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button variant="outline" onClick={() => applyPreset('video')}>
                  {PRESETS.video.name}
                </Button>
                <Button variant="outline" onClick={() => applyPreset('documents')}>
                  {PRESETS.documents.name}
                </Button>
                <Button variant="outline" onClick={() => applyPreset('images')}>
                  {PRESETS.images.name}
                </Button>
              </CardContent>
            </Card>

            {/* Simple Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Simple Filters</CardTitle>
                <CardDescription>
                  Enter URL patterns to match (one per line, e.g., .m3u8, video.mp4)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.simpleFilters.join('\n')}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      simpleFilters: e.target.value.split('\n').filter((s) => s.trim()),
                    })
                  }
                  placeholder=".m3u8&#10;.mpd&#10;.ts"
                  rows={6}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            {/* Regex Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Regular Expression Filters</CardTitle>
                <CardDescription>
                  Advanced regex patterns (one per line, case-insensitive)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.regexFilters.join('\n')}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      regexFilters: e.target.value.split('\n').filter((s) => s.trim()),
                    })
                  }
                  placeholder=".*\\.m3u8.*&#10;/api/video/.*"
                  rows={6}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            {/* Resource Types */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Types</CardTitle>
                <CardDescription>Select which resource types to capture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {RESOURCE_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.value}
                        checked={settings.resourceTypes.includes(type.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSettings({
                              ...settings,
                              resourceTypes: [...settings.resourceTypes, type.value],
                            });
                          } else {
                            setSettings({
                              ...settings,
                              resourceTypes: settings.resourceTypes.filter((t) => t !== type.value),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={type.value} className="text-sm font-normal">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Domain Filters */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Allow List</CardTitle>
                  <CardDescription>
                    Only capture from these domains (empty = all allowed)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={settings.allowList.join('\n')}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        allowList: e.target.value.split('\n').filter((s) => s.trim()),
                      })
                    }
                    placeholder="example.com&#10;*.cdn.com"
                    rows={5}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deny List</CardTitle>
                  <CardDescription>Never capture from these domains</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={settings.denyList.join('\n')}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        denyList: e.target.value.split('\n').filter((s) => s.trim()),
                      })
                    }
                    placeholder="ads.example.com&#10;tracker.*"
                    rows={5}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Collection Policy Tab */}
          <TabsContent value="policy" className="space-y-6">
            {/* HLS/MPD Mode */}
            <Card>
              <CardHeader>
                <CardTitle>HLS/DASH Streaming Mode</CardTitle>
                <CardDescription>Control how streaming media segments are captured</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={settings.hlsMpdMode}
                  onValueChange={(value: 'playlistOnly' | 'all') =>
                    setSettings({ ...settings, hlsMpdMode: value })
                  }
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="playlistOnly" id="playlist-only" />
                    <Label htmlFor="playlist-only" className="font-normal">
                      <div>
                        <span className="font-medium">Playlist/Metadata Only</span>
                        <Badge variant="secondary" className="ml-2">
                          Recommended
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Only capture .m3u8/.mpd playlists, skip individual segments (.ts, .m4s)
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-segments" />
                    <Label htmlFor="all-segments" className="font-normal">
                      <div>
                        <span className="font-medium">All Segments</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Capture all requests including individual media segments
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Header Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Header Collection Policy</CardTitle>
                <CardDescription>Choose which HTTP headers to capture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="basic-headers"
                    checked={settings.headerPolicy.basic}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        headerPolicy: { ...settings.headerPolicy, basic: !!checked },
                      })
                    }
                  />
                  <Label htmlFor="basic-headers" className="font-normal">
                    <div className="font-medium">Basic Headers (User-Agent, Referer, Origin)</div>
                    <p className="text-sm text-gray-500 mt-1">
                      Safe headers commonly needed for downloading content
                    </p>
                  </Label>
                </div>

                <div className="flex items-start space-x-2 p-4 border border-amber-300 bg-amber-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <Checkbox
                      id="sensitive-headers"
                      checked={settings.headerPolicy.sensitiveEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          headerPolicy: { ...settings.headerPolicy, sensitiveEnabled: !!checked },
                        })
                      }
                    />
                    <Label htmlFor="sensitive-headers" className="ml-2 font-normal">
                      <div className="font-medium text-amber-900">
                        Sensitive Headers (Cookie, Authorization)
                      </div>
                      <p className="text-sm text-amber-700 mt-1">
                        <strong>Warning:</strong> These headers contain authentication credentials.
                        Only enable if you understand the security risks and need them for your
                        specific use case.
                      </p>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Limits & Export Tab */}
          <TabsContent value="limits" className="space-y-6">
            {/* Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Log Limits</CardTitle>
                <CardDescription>Control memory usage and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="max-entries">Maximum Log Entries</Label>
                  <Input
                    id="max-entries"
                    type="number"
                    min="100"
                    max="10000"
                    value={settings.limits.maxEntries}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        limits: { ...settings.limits, maxEntries: parseInt(e.target.value) },
                      })
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Older entries are automatically removed when this limit is reached
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Export Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Export Settings</CardTitle>
                <CardDescription>Customize export file naming and format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="filename-template">Filename Template</Label>
                  <Input
                    id="filename-template"
                    value={settings.exportSettings.filenameTemplate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        exportSettings: {
                          ...settings.exportSettings,
                          filenameTemplate: e.target.value,
                        },
                      })
                    }
                    placeholder="netlog_{date}_{domain}.{ext}"
                  />
                  <p className="text-sm text-gray-500">
                    Variables: {'{date}'}, {'{domain}'}, {'{ext}'}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="newline">Line Ending</Label>
                  <RadioGroup
                    value={settings.exportSettings.newline}
                    onValueChange={(value: 'LF' | 'CRLF') =>
                      setSettings({
                        ...settings,
                        exportSettings: { ...settings.exportSettings, newline: value },
                      })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="LF" id="lf" />
                      <Label htmlFor="lf" className="font-normal">
                        LF (Unix/Linux/Mac)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CRLF" id="crlf" />
                      <Label htmlFor="crlf" className="font-normal">
                        CRLF (Windows)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import/Export Settings</CardTitle>
                <CardDescription>Backup your settings or share them across devices</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button variant="outline" onClick={handleExportSettings}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Settings
                </Button>
                <Button variant="outline" onClick={handleImportSettings}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between p-6 bg-white border rounded-lg">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>

          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-green-600 font-medium">Settings saved!</span>}
            <Button onClick={handleSave} disabled={loading} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

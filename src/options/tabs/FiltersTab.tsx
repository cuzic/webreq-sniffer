/**
 * Filters Tab Component
 * URL and resource type filtering settings
 */

import type { PreviewResult } from '@/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FilterPreview } from '../components/FilterPreview';
import { getStatus } from '../messaging';
import { shouldLogRequest } from '@/background/filtering';
import { validateRegex } from '@/lib/utils';
import { Logger } from '@/lib/logger';
import { useSettings } from '@/contexts/SettingsContext';

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
    resourceTypes: ['media', 'xmlhttprequest', 'other'],
  },
  documents: {
    name: 'ドキュメント',
    simpleFilters: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    resourceTypes: ['main_frame', 'xmlhttprequest', 'other'],
  },
  images: {
    name: '画像',
    simpleFilters: [],
    resourceTypes: ['image'],
  },
};

export function FiltersTab() {
  const { settings, updateSettings } = useSettings();
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | undefined>();
  const [regexErrors, setRegexErrors] = useState<Map<number, string>>(new Map());

  // Calculate preview with debouncing
  useEffect(() => {
    const calculatePreview = async () => {
      setPreviewLoading(true);
      setPreviewError(undefined);

      try {
        // Get current log entries
        const status = await getStatus();
        const entries = status.entries;

        // Filter entries based on current settings
        const matched = entries.filter((entry) =>
          shouldLogRequest(entry.url, entry.type, settings)
        );

        // Get sample URLs (first 5)
        const samples = matched.slice(0, 5).map((e) => e.url);

        setPreviewResult({
          total: entries.length,
          matched: matched.length,
          matchRate: entries.length > 0 ? (matched.length / entries.length) * 100 : 0,
          samples,
        });
      } catch (error) {
        Logger.error('FiltersTab', error, { context: 'calculatePreview' });
        setPreviewError(error instanceof Error ? error.message : 'プレビューの計算に失敗しました');
      } finally {
        setPreviewLoading(false);
      }
    };

    // Debounce: wait 500ms after last change
    const timeoutId = setTimeout(calculatePreview, 500);
    return () => clearTimeout(timeoutId);
  }, [
    settings.simpleFilters,
    settings.regexFilters,
    settings.resourceTypes,
    settings.allowList,
    settings.denyList,
    settings.hlsMpdMode,
  ]);

  // Validate regex filters
  useEffect(() => {
    const errors = new Map<number, string>();
    settings.regexFilters.forEach((pattern, index) => {
      const result = validateRegex(pattern);
      if (!result.valid && result.error) {
        errors.set(index, result.error);
      }
    });
    setRegexErrors(errors);
  }, [settings.regexFilters]);

  function applyPreset(preset: keyof typeof PRESETS) {
    const p = PRESETS[preset];
    updateSettings({
      simpleFilters: p.simpleFilters,
      resourceTypes: p.resourceTypes,
    });
  }

  function toggleResourceType(type: string) {
    const types = settings.resourceTypes;
    const newTypes = types.includes(type) ? types.filter((t) => t !== type) : [...types, type];
    updateSettings({ resourceTypes: newTypes });
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Presets</CardTitle>
          <CardDescription>Quick filter configurations for common use cases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => applyPreset('video')}>
              {PRESETS.video.name}
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset('documents')}>
              {PRESETS.documents.name}
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset('images')}>
              {PRESETS.images.name}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simple Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Simple Filters</CardTitle>
          <CardDescription>
            URL patterns to match (e.g., .m3u8, .mpd, /api/). One per line.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={5}
            value={settings.simpleFilters.join('\n')}
            onChange={(e) =>
              updateSettings({
                simpleFilters: e.target.value.split('\n').filter((f) => f.trim()),
              })
            }
            placeholder=".m3u8&#10;.mpd&#10;/api/"
          />
        </CardContent>
      </Card>

      {/* Regex Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Regular Expression Filters</CardTitle>
          <CardDescription>
            Advanced regex patterns (e.g., .*\.m3u8.*). One per line.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={5}
            value={settings.regexFilters.join('\n')}
            onChange={(e) =>
              updateSettings({
                regexFilters: e.target.value.split('\n').filter((f) => f.trim()),
              })
            }
            placeholder=".*\.m3u8.*&#10;/video/\d+"
            className={regexErrors.size > 0 ? 'border-destructive' : ''}
          />
          {/* Regex validation errors */}
          {regexErrors.size > 0 && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm">
              <p className="font-medium text-destructive mb-2">正規表現エラー:</p>
              <ul className="list-disc list-inside space-y-1 text-destructive/90">
                {Array.from(regexErrors.entries()).map(([index, error]) => (
                  <li key={index} className="text-xs">
                    行 {index + 1}: {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Preview */}
      <FilterPreview result={previewResult} loading={previewLoading} error={previewError} />

      {/* Resource Types */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Types</CardTitle>
          <CardDescription>
            Filter by resource type. Leave empty to allow all types.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {RESOURCE_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={settings.resourceTypes.includes(type.value)}
                  onCheckedChange={() => toggleResourceType(type.value)}
                />
                <label htmlFor={`type-${type.value}`} className="text-sm cursor-pointer">
                  {type.label}
                </label>
              </div>
            ))}
          </div>
          {settings.resourceTypes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {settings.resourceTypes.map((type) => (
                <Badge key={type} variant="secondary">
                  {RESOURCE_TYPES.find((t) => t.value === type)?.label || type}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allow/Deny Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Allow List</CardTitle>
            <CardDescription>Only log URLs matching these patterns (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              value={settings.allowList.join('\n')}
              onChange={(e) =>
                updateSettings({
                  allowList: e.target.value.split('\n').filter((f) => f.trim()),
                })
              }
              placeholder="cdn.example.com&#10;*.video-cdn.net"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deny List</CardTitle>
            <CardDescription>Never log URLs matching these patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              value={settings.denyList.join('\n')}
              onChange={(e) =>
                updateSettings({
                  denyList: e.target.value.split('\n').filter((f) => f.trim()),
                })
              }
              placeholder="analytics.google.com&#10;*.tracker.com"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

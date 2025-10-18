/**
 * Collection Policy Tab Component
 * Header collection and HLS/MPD mode settings
 */

import type { Settings } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface CollectionTabProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export function CollectionTab({ settings, onSettingsChange }: CollectionTabProps) {
  return (
    <div className="space-y-6">
      {/* Header Collection */}
      <Card>
        <CardHeader>
          <CardTitle>Header Collection</CardTitle>
          <CardDescription>Configure which HTTP headers to capture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Basic Headers */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="basic-headers"
                checked={settings.headerPolicy.basic}
                onCheckedChange={(checked) =>
                  onSettingsChange({
                    ...settings,
                    headerPolicy: { ...settings.headerPolicy, basic: !!checked },
                  })
                }
              />
              <Label htmlFor="basic-headers" className="font-normal">
                <div className="font-medium">Basic Headers (User-Agent, Referer, Origin)</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Commonly needed headers for download scripts
                </p>
              </Label>
            </div>

            {/* Sensitive Headers */}
            <div className="flex items-start space-x-2 p-4 border border-amber-300 bg-amber-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <Checkbox
                  id="sensitive-headers"
                  checked={settings.headerPolicy.sensitiveEnabled}
                  onCheckedChange={(checked) =>
                    onSettingsChange({
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
                    <strong>Warning:</strong> These headers contain authentication credentials. Only
                    enable if absolutely necessary and handle exported files with care.
                  </p>
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HLS/MPD Mode */}
      <Card>
        <CardHeader>
          <CardTitle>HLS/DASH Streaming Mode</CardTitle>
          <CardDescription>
            Configure how to handle HLS (.m3u8) and DASH (.mpd) streaming content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.hlsMpdMode}
            onValueChange={(value) =>
              onSettingsChange({ ...settings, hlsMpdMode: value as 'all' | 'playlistOnly' })
            }
          >
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="playlistOnly" id="playlist-only" />
                <Label htmlFor="playlist-only" className="font-normal">
                  <div className="font-medium">Playlist/Manifest Only</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Only capture .m3u8 and .mpd files. Skip individual segments (.ts, .m4s).
                    Recommended for most use cases.
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <RadioGroupItem value="all" id="all-segments" />
                <Label htmlFor="all-segments" className="font-normal">
                  <div className="font-medium">All Segments</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Capture all requests including individual media segments. May generate very
                    large logs.
                  </p>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Target Scope */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Scope</CardTitle>
          <CardDescription>Choose which tabs to monitor</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.targetScope}
            onValueChange={(value) =>
              onSettingsChange({ ...settings, targetScope: value as 'activeTab' | 'allTabs' })
            }
          >
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="activeTab" id="active-tab" />
                <Label htmlFor="active-tab" className="font-normal">
                  <div className="font-medium">Active Tab Only</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monitor requests from the currently active tab
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <RadioGroupItem value="allTabs" id="all-tabs" />
                <Label htmlFor="all-tabs" className="font-normal">
                  <div className="font-medium">All Tabs</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monitor requests from all browser tabs
                  </p>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}

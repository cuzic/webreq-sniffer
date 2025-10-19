/**
 * Limits & Export Tab Component
 * Storage limits and export format settings
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PipelineTemplateEditor } from '../components/PipelineTemplateEditor';
import { useSettings } from '@/contexts/SettingsContext';

export function LimitsTab() {
  const { settings, updateSettings } = useSettings();
  return (
    <div className="space-y-6">
      {/* Storage Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Limits</CardTitle>
          <CardDescription>Configure maximum number of log entries to keep</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="max-entries">Maximum Entries</Label>
            <Input
              id="max-entries"
              type="number"
              min="100"
              max="100000"
              value={settings.limits.maxEntries}
              onChange={(e) =>
                updateSettings({
                  limits: { ...settings.limits, maxEntries: parseInt(e.target.value) || 10000 },
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              Oldest entries will be automatically removed when this limit is reached. Default:
              10,000
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
          <CardDescription>Configure filename and line endings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filename Template */}
          <PipelineTemplateEditor
            value={settings.exportSettings.filenameTemplate}
            onChange={(value) =>
              updateSettings({
                exportSettings: {
                  ...settings.exportSettings,
                  filenameTemplate: value,
                },
              })
            }
          />

          {/* Newline Style */}
          <div className="space-y-2">
            <Label>Line Ending Style</Label>
            <RadioGroup
              value={settings.exportSettings.newline}
              onValueChange={(value) =>
                updateSettings({
                  exportSettings: {
                    ...settings.exportSettings,
                    newline: value as 'LF' | 'CRLF',
                  },
                })
              }
            >
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="LF" id="newline-lf" />
                  <Label htmlFor="newline-lf" className="font-normal">
                    LF (Unix/Linux/Mac)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CRLF" id="newline-crlf" />
                  <Label htmlFor="newline-crlf" className="font-normal">
                    CRLF (Windows)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

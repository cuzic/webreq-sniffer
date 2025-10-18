/**
 * Options Page Component
 * Settings management for WebreqSniffer extension
 */

import { useEffect, useState } from 'react';
import type { Settings } from '@/types';
import { getSettings, updateSettings } from './messaging';
import { defaultSettings } from '@/types/schemas';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';
import { FiltersTab } from './tabs/FiltersTab';
import { CollectionTab } from './tabs/CollectionTab';
import { LimitsTab } from './tabs/LimitsTab';
import { AdvancedTab } from './tabs/AdvancedTab';
import { PresetsTab } from './tabs/PresetsTab';
import { ExportTab } from './tabs/ExportTab';
import { UI } from '@/lib/constants';

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
      setTimeout(() => setSaved(false), UI.TOAST_DURATION);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(`Failed to save settings: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">WebreqSniffer Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure network request monitoring and export settings
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="filters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="collection">Collection</TabsTrigger>
            <TabsTrigger value="limits">Limits</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="presets">
            <PresetsTab settings={settings} onSettingsChange={setSettings} />
          </TabsContent>

          <TabsContent value="filters">
            <FiltersTab settings={settings} onSettingsChange={setSettings} />
          </TabsContent>

          <TabsContent value="collection">
            <CollectionTab settings={settings} onSettingsChange={setSettings} />
          </TabsContent>

          <TabsContent value="limits">
            <LimitsTab settings={settings} onSettingsChange={setSettings} />
          </TabsContent>

          <TabsContent value="export">
            <ExportTab settings={settings} onSettingsChange={setSettings} />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedTab settings={settings} onSettingsChange={setSettings} />
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="sticky bottom-0 bg-background pt-6 pb-4 border-t">
          <div className="flex justify-end gap-3">
            <Button onClick={handleSave} disabled={loading} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

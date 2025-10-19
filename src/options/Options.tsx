/**
 * Options Page Component
 * Settings management for WebreqSniffer extension
 */

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';
import { FiltersTab } from './tabs/FiltersTab';
import { CollectionTab } from './tabs/CollectionTab';
import { LimitsTab } from './tabs/LimitsTab';
import { AdvancedTab } from './tabs/AdvancedTab';
import { PresetsTab } from './tabs/PresetsTab';
import { ExportTab } from './tabs/ExportTab';
import { useSettings } from '@/contexts/SettingsContext';
import { Logger } from '@/lib/logger';

export function Options() {
  const { saving, saved, hasUnsavedChanges, saveSettings } = useSettings();

  async function handleSave() {
    try {
      await saveSettings();
    } catch (error) {
      Logger.error('Options', error, { context: 'saveSettings' });
      alert(`Failed to save settings: ${error}`);
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
            <PresetsTab />
          </TabsContent>

          <TabsContent value="filters">
            <FiltersTab />
          </TabsContent>

          <TabsContent value="collection">
            <CollectionTab />
          </TabsContent>

          <TabsContent value="limits">
            <LimitsTab />
          </TabsContent>

          <TabsContent value="export">
            <ExportTab />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedTab />
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="sticky bottom-0 bg-background pt-6 pb-4 border-t">
          <div className="flex justify-end gap-3">
            {hasUnsavedChanges && (
              <p className="text-sm text-muted-foreground self-center">Unsaved changes</p>
            )}
            <Button onClick={handleSave} disabled={saving || !hasUnsavedChanges} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

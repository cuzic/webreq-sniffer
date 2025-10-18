/**
 * Presets Tab Component
 * Manage custom filter presets
 */

import type { Settings, CustomPreset } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { PresetCard } from '../components/PresetCard';
import { PresetEditor } from '../components/PresetEditor';

interface PresetsTabProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export function PresetsTab({ settings, onSettingsChange }: PresetsTabProps) {
  const [editingPreset, setEditingPreset] = useState<CustomPreset | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  function handleCreatePreset() {
    setEditingPreset(null);
    setShowEditor(true);
  }

  function handleEditPreset(preset: CustomPreset) {
    setEditingPreset(preset);
    setShowEditor(true);
  }

  function handleDeletePreset(id: string) {
    onSettingsChange({
      ...settings,
      customPresets: settings.customPresets.filter((p) => p.id !== id),
    });
  }

  function handleSavePreset(preset: CustomPreset) {
    if (editingPreset) {
      // Update existing preset
      onSettingsChange({
        ...settings,
        customPresets: settings.customPresets.map((p) => (p.id === preset.id ? preset : p)),
      });
    } else {
      // Add new preset
      onSettingsChange({
        ...settings,
        customPresets: [...settings.customPresets, preset],
      });
    }
    setShowEditor(false);
    setEditingPreset(null);
  }

  function handleApplyPreset(preset: CustomPreset) {
    onSettingsChange({
      ...settings,
      simpleFilters: preset.simpleFilters,
      regexFilters: preset.regexFilters,
      resourceTypes: preset.resourceTypes,
      allowList: preset.allowList,
      denyList: preset.denyList,
      hlsMpdMode: preset.hlsMpdMode,
    });
  }

  function handleSaveAsPreset() {
    const newPreset: CustomPreset = {
      id: crypto.randomUUID(),
      name: '新しいプリセット',
      simpleFilters: settings.simpleFilters,
      regexFilters: settings.regexFilters,
      resourceTypes: settings.resourceTypes,
      allowList: settings.allowList,
      denyList: settings.denyList,
      hlsMpdMode: settings.hlsMpdMode,
    };
    setEditingPreset(newPreset);
    setShowEditor(true);
  }

  return (
    <div className="space-y-6">
      {/* Current Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>現在の設定</CardTitle>
          <CardDescription>現在のフィルタ設定をプリセットとして保存できます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Simple Filters:</span> {settings.simpleFilters.length}
                件
              </div>
              <div>
                <span className="font-medium">Regex Filters:</span> {settings.regexFilters.length}件
              </div>
              <div>
                <span className="font-medium">Resource Types:</span> {settings.resourceTypes.length}
                件
              </div>
              <div>
                <span className="font-medium">HLS/MPD Mode:</span> {settings.hlsMpdMode}
              </div>
            </div>
            <Button onClick={handleSaveAsPreset} variant="outline" className="w-full">
              現在の設定をプリセットとして保存
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Presets Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>カスタムプリセット</CardTitle>
              <CardDescription>よく使う設定をプリセットとして保存</CardDescription>
            </div>
            <Button onClick={handleCreatePreset} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {settings.customPresets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>カスタムプリセットがありません</p>
              <p className="text-sm mt-2">
                「新規作成」ボタンまたは「現在の設定を保存」で作成できます
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {settings.customPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onApply={() => handleApplyPreset(preset)}
                  onEdit={() => handleEditPreset(preset)}
                  onDelete={() => handleDeletePreset(preset.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preset Editor Dialog */}
      {showEditor && (
        <PresetEditor
          preset={editingPreset}
          open={showEditor}
          onOpenChange={setShowEditor}
          onSave={handleSavePreset}
        />
      )}
    </div>
  );
}

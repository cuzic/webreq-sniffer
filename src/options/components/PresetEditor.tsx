/**
 * PresetEditor Component
 * Dialog for creating/editing custom presets
 */

import type { CustomPreset } from '@/types';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PresetEditorProps {
  preset: CustomPreset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (preset: CustomPreset) => void;
}

const EMOJI_OPTIONS = ['📺', '🐦', '📰', '🎬', '🎵', '📸', '🎮', '📚', '🌐', '⭐'];

export function PresetEditor({ preset, open, onOpenChange, onSave }: PresetEditorProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>('📺');

  useEffect(() => {
    if (preset) {
      setName(preset.name);
      setIcon(preset.icon || '📺');
    } else {
      setName('');
      setIcon('📺');
    }
  }, [preset, open]);

  function handleSave() {
    const savedPreset: CustomPreset = preset
      ? { ...preset, name, icon }
      : {
          id: crypto.randomUUID(),
          name,
          icon,
          simpleFilters: [],
          regexFilters: [],
          resourceTypes: [],
          allowList: [],
          denyList: [],
          hlsMpdMode: 'playlistOnly',
        };

    onSave(savedPreset);
  }

  const isValid = name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{preset ? 'プリセットを編集' : '新しいプリセットを作成'}</DialogTitle>
          <DialogDescription>
            {preset
              ? 'プリセットの名前とアイコンを編集できます。'
              : 'プリセットの名前とアイコンを設定してください。'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name Input */}
          <div className="grid gap-2">
            <Label htmlFor="preset-name">プリセット名 *</Label>
            <Input
              id="preset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: YouTube用"
            />
          </div>

          {/* Icon Select */}
          <div className="grid gap-2">
            <Label htmlFor="preset-icon">アイコン</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger id="preset-icon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMOJI_OPTIONS.map((emoji) => (
                  <SelectItem key={emoji} value={emoji}>
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{emoji}</span>
                      <span>{emoji}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info about filter settings */}
          {preset && (
            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium mb-1">フィルタ設定:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Simple Filters: {preset.simpleFilters.length}件</li>
                <li>Regex Filters: {preset.regexFilters.length}件</li>
                <li>Resource Types: {preset.resourceTypes.length}件</li>
              </ul>
              <p className="mt-2 text-xs">
                フィルタの内容を変更するには、このプリセットを適用してから各タブで編集してください。
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {preset ? '更新' : '作成'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

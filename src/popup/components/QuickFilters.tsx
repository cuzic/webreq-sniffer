/**
 * QuickFilters Component
 * Quick filter preset chips for common use cases
 */

import { Button } from '@/components/ui/button';
import { getFilterPresets } from '@/lib/filter-presets';
import type { Settings } from '@/types';
import { Video, Image, Code, FileText, Globe } from 'lucide-react';

interface QuickFiltersProps {
  settings: Settings;
  onApplyPreset: (presetId: string) => void;
}

// Icon mapping for Lucide icons
const iconMap = {
  Video,
  Image,
  Code,
  FileText,
  Globe,
};

/**
 * Check if current settings match a preset
 */
function isPresetActive(presetId: string, settings: Settings): boolean {
  const presets = getFilterPresets();
  const preset = presets.find((p) => p.id === presetId);

  if (!preset) return false;

  // Compare resource types
  const presetResourceTypes = preset.settings.resourceTypes || [];
  const currentResourceTypes = settings.resourceTypes || [];

  // Check if resource types match
  const resourceTypesMatch =
    presetResourceTypes.length === currentResourceTypes.length &&
    presetResourceTypes.every((rt) => currentResourceTypes.includes(rt));

  // Compare URL filter
  const presetUrlFilter = preset.settings.urlFilter || '';
  const currentUrlFilter = settings.urlFilter || '';
  const urlFilterMatch = presetUrlFilter === currentUrlFilter;

  return resourceTypesMatch && urlFilterMatch;
}

export function QuickFilters({ settings, onApplyPreset }: QuickFiltersProps) {
  const presets = getFilterPresets();

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => {
        const Icon = iconMap[preset.icon as keyof typeof iconMap];
        const isActive = isPresetActive(preset.id, settings);

        return (
          <Button
            key={preset.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onApplyPreset(preset.id)}
            aria-label={`${preset.name} - ${preset.description}`}
            className={isActive ? 'bg-primary' : ''}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {preset.name}
          </Button>
        );
      })}
    </div>
  );
}

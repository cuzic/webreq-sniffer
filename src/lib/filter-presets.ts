/**
 * Filter Presets
 * Quick filter presets for common use cases
 */

import type { Settings } from '@/types';

/**
 * Filter Preset Definition
 */
export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  settings: Partial<Settings>;
}

/**
 * Predefined Filter Presets
 */
const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'all',
    name: 'すべて',
    description: 'すべてのリクエストを表示',
    icon: 'Globe',
    settings: {
      resourceTypes: [
        'main_frame',
        'sub_frame',
        'stylesheet',
        'script',
        'image',
        'font',
        'object',
        'xmlhttprequest',
        'ping',
        'csp_report',
        'media',
        'websocket',
        'webtransport',
        'webbundle',
        'other',
      ],
      urlFilter: '',
    },
  },
  {
    id: 'video',
    name: '動画のみ',
    description: '動画ファイルとストリーミングマニフェスト',
    icon: 'Video',
    settings: {
      resourceTypes: ['media'],
      urlFilter: '.*\\.(mp4|webm|m4v|mov|avi|flv|wmv|mkv|m3u8|mpd|ts|m4s)($|\\?|#)',
    },
  },
  {
    id: 'images',
    name: '画像のみ',
    description: '画像ファイル（JPG, PNG, WebP, SVG等）',
    icon: 'Image',
    settings: {
      resourceTypes: ['image'],
      urlFilter: '.*\\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)($|\\?|#)',
    },
  },
  {
    id: 'api',
    name: 'API (JSON/XML)',
    description: 'APIエンドポイントとデータリクエスト',
    icon: 'Code',
    settings: {
      resourceTypes: ['xmlhttprequest'],
      urlFilter:
        '.*((\\.json|\\.xml|/api/|/graphql)($|\\?|#)|content-type.*application/(json|xml))',
    },
  },
  {
    id: 'documents',
    name: 'ドキュメント',
    description: 'PDF、Office文書など',
    icon: 'FileText',
    settings: {
      resourceTypes: ['other'],
      urlFilter: '.*\\.(pdf|docx?|xlsx?|pptx?|txt|rtf|odt|ods|odp)($|\\?|#)',
    },
  },
];

/**
 * Get all available filter presets
 * @returns Array of filter presets
 */
export function getFilterPresets(): FilterPreset[] {
  return FILTER_PRESETS;
}

/**
 * Apply a preset to current settings
 * @param presetId - ID of the preset to apply
 * @param currentSettings - Current settings
 * @returns New settings with preset applied
 * @throws {Error} If preset ID is unknown
 *
 * @example
 * ```typescript
 * const newSettings = applyPreset('video', currentSettings);
 * ```
 */
export function applyPreset(presetId: string, currentSettings: Settings): Settings {
  const preset = FILTER_PRESETS.find((p) => p.id === presetId);

  if (!preset) {
    throw new Error(`Unknown preset: ${presetId}`);
  }

  // Merge preset settings with current settings
  // Preset settings override current values
  return {
    ...currentSettings,
    ...preset.settings,
  };
}

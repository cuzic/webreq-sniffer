/**
 * Filter Presets Tests
 * TDD for Quick Filter Presets feature
 */

import { describe, it, expect } from 'vitest';
import type { Settings } from '@/types';
import { defaultSettings } from '@/types/schemas';
import { getFilterPresets, applyPreset } from '@/lib/filter-presets';

describe('Filter Presets', () => {
  describe('Preset Definitions', () => {
    it('should have video preset', () => {
      const presets = getFilterPresets();
      const videoPreset = presets.find((p) => p.id === 'video');

      expect(videoPreset).toBeDefined();
      expect(videoPreset?.name).toBe('動画のみ');
      expect(videoPreset?.icon).toBe('Video');
    });

    it('should have images preset', () => {
      const presets = getFilterPresets();
      const imagesPreset = presets.find((p) => p.id === 'images');

      expect(imagesPreset).toBeDefined();
      expect(imagesPreset?.name).toBe('画像のみ');
      expect(imagesPreset?.icon).toBe('Image');
    });

    it('should have API preset', () => {
      const presets = getFilterPresets();
      const apiPreset = presets.find((p) => p.id === 'api');

      expect(apiPreset).toBeDefined();
      expect(apiPreset?.name).toBe('API (JSON/XML)');
      expect(apiPreset?.icon).toBe('Code');
    });

    it('should have documents preset', () => {
      const presets = getFilterPresets();
      const docsPreset = presets.find((p) => p.id === 'documents');

      expect(docsPreset).toBeDefined();
      expect(docsPreset?.name).toBe('ドキュメント');
      expect(docsPreset?.icon).toBe('FileText');
    });

    it('should have all presets preset for resetting', () => {
      const presets = getFilterPresets();
      const allPreset = presets.find((p) => p.id === 'all');

      expect(allPreset).toBeDefined();
      expect(allPreset?.name).toBe('すべて');
      expect(allPreset?.icon).toBe('Globe');
    });
  });

  describe('Video Preset', () => {
    it('should filter only media resource types', () => {
      const presets = getFilterPresets();
      const videoPreset = presets.find((p) => p.id === 'video');

      expect(videoPreset?.settings.resourceTypes).toEqual(['media']);
    });

    it('should include common video extensions in URL filter', () => {
      const presets = getFilterPresets();
      const videoPreset = presets.find((p) => p.id === 'video');

      const urlFilter = videoPreset?.settings.urlFilter || '';

      // Should match common video extensions (regex pattern)
      expect(urlFilter).toContain('mp4');
      expect(urlFilter).toContain('m3u8');
      expect(urlFilter).toContain('mpd');
    });
  });

  describe('Images Preset', () => {
    it('should filter only image resource types', () => {
      const presets = getFilterPresets();
      const imagesPreset = presets.find((p) => p.id === 'images');

      expect(imagesPreset?.settings.resourceTypes).toEqual(['image']);
    });

    it('should include common image extensions in URL filter', () => {
      const presets = getFilterPresets();
      const imagesPreset = presets.find((p) => p.id === 'images');

      const urlFilter = imagesPreset?.settings.urlFilter || '';

      // Should match common image extensions (regex pattern)
      expect(urlFilter).toContain('jpg');
      expect(urlFilter).toContain('png');
      expect(urlFilter).toContain('webp');
    });
  });

  describe('API Preset', () => {
    it('should filter only xmlhttprequest resource types', () => {
      const presets = getFilterPresets();
      const apiPreset = presets.find((p) => p.id === 'api');

      expect(apiPreset?.settings.resourceTypes).toEqual(['xmlhttprequest']);
    });

    it('should include JSON and XML in URL filter', () => {
      const presets = getFilterPresets();
      const apiPreset = presets.find((p) => p.id === 'api');

      const urlFilter = apiPreset?.settings.urlFilter || '';

      // Should match API endpoints
      expect(urlFilter).toContain('.json');
      expect(urlFilter).toContain('.xml');
      expect(urlFilter).toContain('/api/');
    });
  });

  describe('Documents Preset', () => {
    it('should filter document-related resource types', () => {
      const presets = getFilterPresets();
      const docsPreset = presets.find((p) => p.id === 'documents');

      expect(docsPreset?.settings.resourceTypes).toContain('other');
    });

    it('should include common document extensions in URL filter', () => {
      const presets = getFilterPresets();
      const docsPreset = presets.find((p) => p.id === 'documents');

      const urlFilter = docsPreset?.settings.urlFilter || '';

      // Should match document extensions (regex pattern)
      expect(urlFilter).toContain('pdf');
      expect(urlFilter).toContain('docx');
      expect(urlFilter).toContain('xlsx');
    });
  });

  describe('applyPreset', () => {
    it('should apply video preset settings', () => {
      const settings = { ...defaultSettings };
      const newSettings = applyPreset('video', settings);

      expect(newSettings.resourceTypes).toEqual(['media']);
      expect(newSettings.urlFilter).toContain('mp4');
    });

    it('should apply images preset settings', () => {
      const settings = { ...defaultSettings };
      const newSettings = applyPreset('images', settings);

      expect(newSettings.resourceTypes).toEqual(['image']);
      expect(newSettings.urlFilter).toContain('jpg');
    });

    it('should apply API preset settings', () => {
      const settings = { ...defaultSettings };
      const newSettings = applyPreset('api', settings);

      expect(newSettings.resourceTypes).toEqual(['xmlhttprequest']);
      expect(newSettings.urlFilter).toContain('/api/');
    });

    it('should reset to all resource types when applying "all" preset', () => {
      const settings = {
        ...defaultSettings,
        resourceTypes: ['image'], // Modified
        urlFilter: 'test', // Modified
      };

      const newSettings = applyPreset('all', settings);

      // "all" preset includes all resource types
      expect(newSettings.resourceTypes.length).toBeGreaterThan(10);
      expect(newSettings.resourceTypes).toContain('image');
      expect(newSettings.resourceTypes).toContain('media');
      expect(newSettings.resourceTypes).toContain('xmlhttprequest');
      expect(newSettings.urlFilter).toBe('');
    });

    it('should preserve other settings when applying preset', () => {
      const settings = {
        ...defaultSettings,
        maxEntries: 500, // Custom value
        headerPolicy: { basic: false, sensitiveEnabled: true }, // Custom value
      };

      const newSettings = applyPreset('video', settings);

      // Preset settings should be applied
      expect(newSettings.resourceTypes).toEqual(['media']);

      // Other settings should be preserved
      expect(newSettings.maxEntries).toBe(500);
      expect(newSettings.headerPolicy).toEqual({ basic: false, sensitiveEnabled: true });
    });

    it('should throw error for unknown preset', () => {
      const settings = { ...defaultSettings };

      expect(() => applyPreset('unknown', settings)).toThrow('Unknown preset: unknown');
    });
  });

  describe('Preset Icon Mapping', () => {
    it('should have valid Lucide icon names', () => {
      const presets = getFilterPresets();
      const validIcons = ['Video', 'Image', 'Code', 'FileText', 'Globe', 'Sparkles'];

      presets.forEach((preset) => {
        expect(validIcons).toContain(preset.icon);
      });
    });
  });
});

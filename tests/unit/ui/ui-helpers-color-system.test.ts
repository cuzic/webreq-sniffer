/**
 * UI Helpers Color System Integration Tests
 * TDD approach for Issue #66 - Phase 2: Apply Color System
 *
 * These tests ensure:
 * 1. Resource type colors use the color system
 * 2. Colors are semantically appropriate
 * 3. Consistent color usage across UI
 */

import { describe, it, expect } from 'vitest';
import { getTypeColor, getTypeBadgeColor, getTypeIcon, getTypeDisplayName } from '@/lib/ui-helpers';

describe('UI Helpers - Color System Integration', () => {
  describe('getTypeColor', () => {
    it('should use semantic colors from the color system', () => {
      // Media types should use info color (blue)
      const mediaColor = getTypeColor('media');
      expect(mediaColor).toMatch(/info/); // Should use info semantic color

      // XHR should use success color (green)
      const xhrColor = getTypeColor('xmlhttprequest');
      expect(xhrColor).toMatch(/success/); // Should use success semantic color

      // Script should use warning color (yellow/amber)
      const scriptColor = getTypeColor('script');
      expect(scriptColor).toMatch(/warning/); // Should use warning semantic color
    });

    it('should use muted color for unknown types', () => {
      const unknownColor = getTypeColor('unknown-type');
      expect(unknownColor).toMatch(/muted/); // Unknown should use muted color
    });

    it('should return consistent color classes for the same type', () => {
      const color1 = getTypeColor('media');
      const color2 = getTypeColor('media');
      expect(color1).toBe(color2);
    });

    it('should use color system variables instead of hardcoded colors', () => {
      const mediaColor = getTypeColor('media');

      // Should NOT contain hardcoded Tailwind colors
      expect(mediaColor).not.toMatch(/bg-blue-\d+/);
      expect(mediaColor).not.toMatch(/border-blue-\d+/);

      // Should use semantic color classes (with or without opacity)
      expect(mediaColor).toMatch(/bg-(info|success|warning|error|accent|primary|secondary|muted)/);
    });
  });

  describe('getTypeBadgeColor', () => {
    it('should use semantic badge colors from the color system', () => {
      // Badge colors should use semantic colors
      const mediaBadge = getTypeBadgeColor('media');
      expect(mediaBadge).toMatch(/(info|success|warning|error|accent|primary|secondary|muted)/);

      const xhrBadge = getTypeBadgeColor('xmlhttprequest');
      expect(xhrBadge).toMatch(/(info|success|warning|error|accent|primary|secondary|muted)/);
    });

    it('should use muted badge for unknown types', () => {
      const unknownBadge = getTypeBadgeColor('unknown-type');
      expect(unknownBadge).toMatch(/muted/);
    });

    it('should not use hardcoded color values', () => {
      const types = ['media', 'xmlhttprequest', 'script', 'stylesheet', 'image', 'font'];

      types.forEach((type) => {
        const badgeColor = getTypeBadgeColor(type);

        // Should NOT contain hardcoded Tailwind numeric colors
        expect(badgeColor).not.toMatch(/bg-blue-\d+/);
        expect(badgeColor).not.toMatch(/text-green-\d+/);
        expect(badgeColor).not.toMatch(/bg-yellow-\d+/);
      });
    });
  });

  describe('getTypeIcon', () => {
    it('should return emoji icons for each resource type', () => {
      expect(getTypeIcon('media')).toBe('🎬');
      expect(getTypeIcon('xmlhttprequest')).toBe('📡');
      expect(getTypeIcon('script')).toBe('📜');
      expect(getTypeIcon('stylesheet')).toBe('🎨');
      expect(getTypeIcon('image')).toBe('🖼️');
      expect(getTypeIcon('font')).toBe('🔤');
      expect(getTypeIcon('document')).toBe('📄');
    });

    it('should return default icon for unknown types', () => {
      expect(getTypeIcon('unknown')).toBe('📦');
    });
  });

  describe('getTypeDisplayName', () => {
    it('should return user-friendly display names', () => {
      expect(getTypeDisplayName('media')).toBe('Media');
      expect(getTypeDisplayName('xmlhttprequest')).toBe('XHR');
      expect(getTypeDisplayName('script')).toBe('JS');
      expect(getTypeDisplayName('stylesheet')).toBe('CSS');
    });

    it('should return the type itself for unknown types', () => {
      expect(getTypeDisplayName('custom-type')).toBe('custom-type');
    });
  });

  describe('Color System Consistency', () => {
    it('should use consistent color mapping across all resource types', () => {
      const types = [
        'media',
        'xmlhttprequest',
        'script',
        'stylesheet',
        'image',
        'font',
        'document',
      ];

      types.forEach((type) => {
        const color = getTypeColor(type);
        const badgeColor = getTypeBadgeColor(type);

        // Extract base color from both (including all semantic colors)
        const baseColorMatch = color.match(
          /(info|success|warning|error|muted|accent|primary|secondary|card|border)/
        );
        const badgeColorMatch = badgeColor.match(
          /(info|success|warning|error|muted|accent|primary|secondary|card|border)/
        );

        // Both should use colors from the color system
        expect(baseColorMatch).toBeTruthy();
        expect(badgeColorMatch).toBeTruthy();

        // Both should use the same base semantic color
        if (baseColorMatch && badgeColorMatch) {
          expect(baseColorMatch[1]).toBe(badgeColorMatch[1]);
        }
      });
    });

    it('should use appropriate semantic colors for each type', () => {
      // Media (videos, audio) -> Info (blue)
      expect(getTypeColor('media')).toMatch(/info/);

      // XHR (API calls) -> Success (green)
      expect(getTypeColor('xmlhttprequest')).toMatch(/success/);

      // Script (JavaScript) -> Warning (yellow/amber)
      expect(getTypeColor('script')).toMatch(/warning/);

      // Stylesheet (CSS) -> Accent (purple/secondary)
      expect(getTypeColor('stylesheet')).toMatch(/accent/);
    });

    it('should provide sufficient visual differentiation', () => {
      const types = ['media', 'xmlhttprequest', 'script', 'stylesheet'];
      const colors = types.map((type) => getTypeColor(type));

      // All colors should be different
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(types.length);
    });
  });

  describe('Color System - WCAG Compliance', () => {
    it('should use colors with sufficient contrast', () => {
      // This test ensures we're using colors from our WCAG AA compliant color system
      const types = ['media', 'xmlhttprequest', 'script', 'stylesheet'];

      types.forEach((type) => {
        const color = getTypeColor(type);

        // Should use our defined semantic colors which are WCAG AA compliant
        const usesSemanticColor = color.match(
          /(info|success|warning|error|accent|muted|primary|secondary)/
        );
        expect(usesSemanticColor).toBeTruthy();
      });
    });

    it('should provide readable badge text colors', () => {
      const types = ['media', 'xmlhttprequest', 'script'];

      types.forEach((type) => {
        const badgeColor = getTypeBadgeColor(type);

        // Badge should include foreground color for text
        const hasForeground = badgeColor.includes('-foreground') || badgeColor.includes('text-');

        expect(hasForeground).toBeTruthy();
      });
    });
  });
});

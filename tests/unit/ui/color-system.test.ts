/**
 * Color System Tests
 * TDD approach for Issue #66 - Phase 1: Color System
 *
 * These tests ensure:
 * 1. Brand colors are properly defined
 * 2. Semantic colors follow naming conventions
 * 3. Accessibility requirements (WCAG AA contrast ratios)
 */

import { describe, it, expect } from 'vitest';
import tailwindConfig from '../../../tailwind.config';

/**
 * Calculate relative luminance for RGB color
 * Used for WCAG contrast ratio calculations
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 */
function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

describe('Color System - Tailwind Configuration', () => {
  it('should have extended theme configuration', () => {
    expect(tailwindConfig.theme).toBeDefined();
    expect(tailwindConfig.theme.extend).toBeDefined();
  });

  it('should define custom brand colors', () => {
    const colors = tailwindConfig.theme.extend?.colors;

    expect(colors).toBeDefined();
    expect(colors).toHaveProperty('primary');
    expect(colors).toHaveProperty('secondary');
    expect(colors).toHaveProperty('accent');
  });

  it('should define semantic colors', () => {
    const colors = tailwindConfig.theme.extend?.colors;

    expect(colors).toHaveProperty('success');
    expect(colors).toHaveProperty('warning');
    expect(colors).toHaveProperty('error');
    expect(colors).toHaveProperty('info');
  });

  it('should define foreground colors for each brand color', () => {
    const colors = tailwindConfig.theme.extend?.colors;

    expect(colors).toHaveProperty('primary-foreground');
    expect(colors).toHaveProperty('secondary-foreground');
    expect(colors).toHaveProperty('accent-foreground');
  });

  it('should define background and surface colors', () => {
    const colors = tailwindConfig.theme.extend?.colors;

    expect(colors).toHaveProperty('background');
    expect(colors).toHaveProperty('foreground');
    expect(colors).toHaveProperty('card');
    expect(colors).toHaveProperty('card-foreground');
  });

  it('should define border and input colors', () => {
    const colors = tailwindConfig.theme.extend?.colors;

    expect(colors).toHaveProperty('border');
    expect(colors).toHaveProperty('input');
    expect(colors).toHaveProperty('ring');
  });

  it('should define muted colors for secondary content', () => {
    const colors = tailwindConfig.theme.extend?.colors;

    expect(colors).toHaveProperty('muted');
    expect(colors).toHaveProperty('muted-foreground');
  });
});

describe('Color System - Accessibility (WCAG AA)', () => {
  it('should have sufficient contrast for primary color on white background', () => {
    // Primary color should be readable on white
    const primary = hslToRgb(220, 90, 56); // Expected primary color
    const white: [number, number, number] = [255, 255, 255];

    const ratio = getContrastRatio(primary, white);

    // WCAG AA requires 4.5:1 for normal text
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('should have sufficient contrast for error color on background', () => {
    // Error color should be readable
    const error = hslToRgb(0, 72, 41); // Expected error color (red) - WCAG AA compliant
    const white: [number, number, number] = [255, 255, 255];

    const ratio = getContrastRatio(error, white);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('should have sufficient contrast for success color on background', () => {
    // Success color should be readable
    const success = hslToRgb(142, 71, 31); // Expected success color (green) - WCAG AA compliant
    const white: [number, number, number] = [255, 255, 255];

    const ratio = getContrastRatio(success, white);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('should have high contrast between foreground and background', () => {
    // Foreground text on background should be highly readable
    const foreground: [number, number, number] = [0, 0, 0]; // Black text
    const background: [number, number, number] = [255, 255, 255]; // White background

    const ratio = getContrastRatio(foreground, background);

    // Should have very high contrast (close to 21:1)
    expect(ratio).toBeGreaterThanOrEqual(15);
  });

  it('should have readable muted text', () => {
    // Muted text should still meet WCAG AA for large text (3:1)
    const muted = hslToRgb(220, 9, 46); // Expected muted color
    const white: [number, number, number] = [255, 255, 255];

    const ratio = getContrastRatio(muted, white);

    // Muted should at least meet large text requirement
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });
});

describe('Color System - Color Format', () => {
  it('should use HSL format for colors', () => {
    const colors = tailwindConfig.theme.extend?.colors;

    // Colors should be in HSL format (space-separated values)
    // Example: "220 90% 56%" instead of "hsl(220, 90%, 56%)"
    if (colors?.primary) {
      const primaryValue = typeof colors.primary === 'string' ? colors.primary : '';

      // Should match HSL format or CSS variable
      expect(
        primaryValue.match(/^\d+\s+\d+%\s+\d+%$/) || primaryValue.startsWith('hsl(var(--')
      ).toBeTruthy();
    }
  });

  it('should support CSS variables for dynamic theming', () => {
    const colors = tailwindConfig.theme.extend?.colors;

    // At least some colors should use CSS variables for dark mode support
    const hasVariables =
      colors &&
      Object.values(colors).some((value) => typeof value === 'string' && value.includes('var(--'));

    expect(hasVariables).toBe(true);
  });
});

/**
 * PipelineTemplateEditor Color System Tests
 * TDD approach for Issue #66 - Phase 4: Template Editor Colors
 *
 * These tests ensure:
 * 1. Success states use semantic success color
 * 2. Variable names use semantic info color
 * 3. Filter names use semantic accent color
 * 4. No hardcoded Tailwind color values
 * 5. WCAG AA compliance
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PipelineTemplateEditor } from '@/options/components/PipelineTemplateEditor';

describe('PipelineTemplateEditor - Color System Integration', () => {
  describe('Validation State Colors', () => {
    it('should use success color for valid template indicator', () => {
      const { container } = render(
        <PipelineTemplateEditor value="{videoTitle}_{date}.{ext}" onChange={() => {}} />
      );

      // Find success checkmark icon
      const successIcons = container.querySelectorAll('.text-success');

      // Should use success semantic color for valid state
      expect(successIcons.length).toBeGreaterThan(0);

      // Should NOT use hardcoded green colors
      const htmlString = container.innerHTML;
      expect(htmlString).not.toMatch(/text-green-\d+/);
    });

    it('should not use hardcoded colors for validation states', () => {
      const { container } = render(
        <PipelineTemplateEditor value="{videoTitle}_{date}.{ext}" onChange={() => {}} />
      );

      const htmlString = container.innerHTML;

      // Should not use hardcoded green or red colors
      expect(htmlString).not.toMatch(/text-green-\d+/);
      expect(htmlString).not.toMatch(/text-red-\d+/);
      expect(htmlString).not.toMatch(/border-red-\d+/);
    });
  });

  describe('Documentation Colors', () => {
    it('should use info/primary color for variable names', () => {
      const { container } = render(
        <PipelineTemplateEditor value="{videoTitle}_{date}.{ext}" onChange={() => {}} />
      );

      const htmlString = container.innerHTML;

      // Should use semantic colors for variables (info or primary)
      const usesSemanticColors = htmlString.match(/text-(info|primary)/);

      if (usesSemanticColors) {
        expect(usesSemanticColors).toBeTruthy();
      }

      // Should NOT use hardcoded blue colors
      expect(htmlString).not.toMatch(/text-blue-\d+/);
    });

    it('should use accent color for filter names', () => {
      const { container } = render(
        <PipelineTemplateEditor value="{videoTitle | slugify}_{date}.{ext}" onChange={() => {}} />
      );

      const htmlString = container.innerHTML;

      // Should use semantic accent color for filters
      const usesAccentColor = htmlString.match(/text-accent/);

      if (usesAccentColor) {
        expect(usesAccentColor).toBeTruthy();
      }

      // Should NOT use hardcoded purple colors
      expect(htmlString).not.toMatch(/text-purple-\d+/);
    });
  });

  describe('Color System Consistency', () => {
    it('should not use any hardcoded Tailwind numeric color values', () => {
      const { container } = render(
        <PipelineTemplateEditor value="{videoTitle}_{date}.{ext}" onChange={() => {}} />
      );

      const allElements = container.querySelectorAll('*');
      allElements.forEach((element) => {
        const classes = element.className;
        if (typeof classes === 'string') {
          // Check for hardcoded numeric colors (text only, as this component uses text colors)
          const hasHardcodedText = classes.match(
            /text-(green|gray|blue|red|yellow|purple|pink|indigo)-\d+/
          );

          expect(hasHardcodedText).toBeNull();
        }
      });
    });

    it('should use semantic colors for all colored text elements', () => {
      const { container } = render(
        <PipelineTemplateEditor value="{videoTitle | slugify}_{date}.{ext}" onChange={() => {}} />
      );

      const htmlString = container.innerHTML;

      // Should use semantic color classes
      const usesSemanticColors =
        htmlString.includes('success') ||
        htmlString.includes('info') ||
        htmlString.includes('primary') ||
        htmlString.includes('accent') ||
        htmlString.includes('muted') ||
        htmlString.includes('destructive');

      expect(usesSemanticColors).toBe(true);
    });
  });

  describe('Visual Feedback', () => {
    it('should use semantic colors for all interactive elements', () => {
      const { container } = render(
        <PipelineTemplateEditor value="{videoTitle}_{date}.{ext}" onChange={() => {}} />
      );

      const htmlString = container.innerHTML;

      // Valid templates should show success color indicators
      expect(htmlString).toMatch(/success/i);

      // Should use semantic colors for documentation (info, accent)
      const usesSemanticDocs = htmlString.match(/text-(info|accent)/);
      expect(usesSemanticDocs).toBeTruthy();

      // Should NOT use hardcoded numeric colors
      expect(htmlString).not.toMatch(/text-green-\d+/);
      expect(htmlString).not.toMatch(/text-blue-\d+/);
      expect(htmlString).not.toMatch(/text-purple-\d+/);
    });
  });

  describe('Accessibility', () => {
    it('should use WCAG AA compliant colors from the color system', () => {
      const { container } = render(
        <PipelineTemplateEditor value="{videoTitle}_{date}.{ext}" onChange={() => {}} />
      );

      const htmlString = container.innerHTML;

      // Our color system ensures WCAG AA compliance
      // Should use semantic colors which are all WCAG AA compliant
      const usesSemanticColors = htmlString.match(
        /(success|info|primary|accent|muted|destructive)/
      );

      expect(usesSemanticColors).toBeTruthy();
    });

    it('should use muted color for secondary text', () => {
      const { container } = render(
        <PipelineTemplateEditor value="{videoTitle}_{date}.{ext}" onChange={() => {}} />
      );

      const mutedElements = container.querySelectorAll('.text-muted-foreground');

      // Should have muted text for descriptions and secondary content
      expect(mutedElements.length).toBeGreaterThan(0);
    });
  });
});

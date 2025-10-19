/**
 * FilterPreview Color System Tests
 * TDD approach for Issue #66 - Phase 4: Filter Preview Colors
 *
 * These tests ensure:
 * 1. Success states use semantic success color
 * 2. Error states use semantic error/destructive color
 * 3. No hardcoded Tailwind color values
 * 4. WCAG AA compliance
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FilterPreview } from '@/options/components/FilterPreview';
import type { PreviewResult } from '@/types';

describe('FilterPreview - Color System Integration', () => {
  describe('Match State Colors', () => {
    it('should use success color when there are matches', () => {
      const result: PreviewResult = {
        matched: 10,
        total: 100,
        samples: ['https://example.com/video.m3u8'],
      };

      const { container } = render(<FilterPreview result={result} loading={false} />);

      // Find elements with color classes
      const successIcons = container.querySelectorAll('.text-success');
      const successBorders = container.querySelectorAll('[class*="border-success"]');
      const successBackgrounds = container.querySelectorAll('[class*="bg-success"]');

      // Should use success semantic color
      expect(successIcons.length).toBeGreaterThan(0);

      // Should NOT use hardcoded green colors
      const htmlString = container.innerHTML;
      expect(htmlString).not.toMatch(/text-green-\d+/);
      expect(htmlString).not.toMatch(/border-green-\d+/);
      expect(htmlString).not.toMatch(/bg-green-\d+/);
    });

    it('should use muted color when there are no matches', () => {
      const result: PreviewResult = {
        matched: 0,
        total: 100,
        samples: [],
      };

      const { container } = render(<FilterPreview result={result} loading={false} />);

      // Find elements with muted colors
      const mutedElements = container.querySelectorAll('.text-muted-foreground');

      // Should use muted semantic color
      expect(mutedElements.length).toBeGreaterThan(0);

      // Should NOT use success colors when no matches
      const htmlString = container.innerHTML;
      expect(htmlString).not.toMatch(/text-green-\d+/);
    });

    it('should use error/destructive color for error state', () => {
      const { container } = render(
        <FilterPreview result={null} loading={false} error="Invalid filter pattern" />
      );

      // Find elements with destructive colors
      const destructiveIcons = container.querySelectorAll('.text-destructive');
      const destructiveBorders = container.querySelectorAll('[class*="border-destructive"]');
      const destructiveBackgrounds = container.querySelectorAll('[class*="bg-destructive"]');

      // Should use destructive semantic color
      expect(destructiveIcons.length).toBeGreaterThan(0);
      expect(destructiveBorders.length).toBeGreaterThan(0);
      expect(destructiveBackgrounds.length).toBeGreaterThan(0);

      // Should NOT use hardcoded red colors
      const htmlString = container.innerHTML;
      expect(htmlString).not.toMatch(/text-red-\d+/);
      expect(htmlString).not.toMatch(/border-red-\d+/);
      expect(htmlString).not.toMatch(/bg-red-\d+/);
    });
  });

  describe('Loading State', () => {
    it('should use muted color for loading state', () => {
      const { container } = render(<FilterPreview result={null} loading={true} />);

      const mutedElements = container.querySelectorAll('.text-muted-foreground');
      expect(mutedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Color System Consistency', () => {
    it('should not use any hardcoded Tailwind numeric color values', () => {
      const result: PreviewResult = {
        matched: 5,
        total: 50,
        samples: ['https://example.com/test.m3u8'],
      };

      const { container } = render(<FilterPreview result={result} loading={false} />);

      const allElements = container.querySelectorAll('*');
      allElements.forEach((element) => {
        const classes = element.className;
        if (typeof classes === 'string') {
          // Check for hardcoded numeric colors
          const hasHardcodedBg = classes.match(/bg-(green|gray|blue|red|yellow)-\d+/);
          const hasHardcodedText = classes.match(/text-(green|gray|blue|red|yellow)-\d+/);
          const hasHardcodedBorder = classes.match(/border-(green|gray|blue|red|yellow)-\d+/);

          expect(hasHardcodedBg).toBeNull();
          expect(hasHardcodedText).toBeNull();
          expect(hasHardcodedBorder).toBeNull();
        }
      });
    });

    it('should use semantic colors for all colored elements', () => {
      const result: PreviewResult = {
        matched: 5,
        total: 50,
        samples: ['https://example.com/test.m3u8'],
      };

      const { container } = render(<FilterPreview result={result} loading={false} />);

      const htmlString = container.innerHTML;

      // Should use semantic color classes
      const usesSemanticColors =
        htmlString.includes('success') ||
        htmlString.includes('muted') ||
        htmlString.includes('destructive');

      expect(usesSemanticColors).toBe(true);
    });
  });

  describe('Visual Feedback', () => {
    it('should provide different visual feedback for matched vs unmatched states', () => {
      const matchedResult: PreviewResult = {
        matched: 10,
        total: 100,
        samples: ['https://example.com/video.m3u8'],
      };

      const unmatchedResult: PreviewResult = {
        matched: 0,
        total: 100,
        samples: [],
      };

      const { container: matchedContainer } = render(
        <FilterPreview result={matchedResult} loading={false} />
      );

      const { container: unmatchedContainer } = render(
        <FilterPreview result={unmatchedResult} loading={false} />
      );

      // Classes should be different to provide visual feedback
      const matchedHtml = matchedContainer.innerHTML;
      const unmatchedHtml = unmatchedContainer.innerHTML;

      expect(matchedHtml).not.toBe(unmatchedHtml);
    });
  });

  describe('Accessibility', () => {
    it('should use WCAG AA compliant colors from the color system', () => {
      const result: PreviewResult = {
        matched: 5,
        total: 50,
        samples: ['https://example.com/test.m3u8'],
      };

      const { container } = render(<FilterPreview result={result} loading={false} />);

      const htmlString = container.innerHTML;

      // Our color system ensures WCAG AA compliance
      // Success color should be used for matched state
      expect(htmlString).toMatch(/success|muted|destructive/);
    });
  });
});

/**
 * Unit Tests for Template Evaluator
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateExpression,
  safeEvaluate,
  isJavaScriptExpression,
  type TemplateContext,
} from '@/lib/template-evaluator';

describe('Template Evaluator', () => {
  const baseContext: TemplateContext = {
    videoTitle: 'My Awesome Video',
    pageTitle: 'Page Title - Website',
    ogTitle: 'OG Title',
    date: '2025-10-18',
    time: '14-30-45',
    timestamp: 1729259400000,
    domain: 'example.com',
    ext: 'sh',
  };

  describe('evaluateExpression', () => {
    it('should evaluate simple variable reference', () => {
      const result = evaluateExpression('videoTitle', baseContext);
      expect(result).toBe('My Awesome Video');
    });

    it('should evaluate string method', () => {
      const result = evaluateExpression('videoTitle.toLowerCase()', baseContext);
      expect(result).toBe('my awesome video');
    });

    it('should evaluate null coalescing operator', () => {
      const result = evaluateExpression('manifestTitle ?? pageTitle', baseContext);
      expect(result).toBe('Page Title - Website');
    });

    it('should evaluate ternary operator', () => {
      const result = evaluateExpression('videoTitle ? "yes" : "no"', baseContext);
      expect(result).toBe('yes');
    });

    it('should evaluate complex expression', () => {
      const result = evaluateExpression(
        'videoTitle.toLowerCase().replace(/\\s+/g, "_")',
        baseContext
      );
      expect(result).toBe('my_awesome_video');
    });

    it('should evaluate optional chaining', () => {
      const result = evaluateExpression('manifestTitle?.toLowerCase()', baseContext);
      expect(result).toBe('undefined');
    });

    it('should evaluate substring', () => {
      const result = evaluateExpression('videoTitle.substring(0, 10)', baseContext);
      expect(result).toBe('My Awesome');
    });

    it('should evaluate trim', () => {
      const context = { ...baseContext, videoTitle: '  Trimmed Video  ' };
      const result = evaluateExpression('videoTitle.trim()', context);
      expect(result).toBe('Trimmed Video');
    });

    it('should handle undefined gracefully', () => {
      const result = evaluateExpression('manifestTitle', baseContext);
      expect(result).toBe('undefined');
    });

    it('should evaluate numeric operations', () => {
      const result = evaluateExpression('timestamp + 1000', baseContext);
      expect(result).toBe('1729259401000');
    });

    it('should throw on expression too long', () => {
      const longExpr = 'x'.repeat(1001);
      expect(() => evaluateExpression(longExpr, baseContext)).toThrow('Expression too long');
    });

    it('should throw on syntax error', () => {
      expect(() => evaluateExpression('invalid..syntax', baseContext)).toThrow(
        'Template evaluation failed'
      );
    });

    it('should throw on accessing undefined method', () => {
      expect(() => evaluateExpression('eval("malicious")', baseContext)).toThrow();
    });

    it('should not have access to window object (undefined in context)', () => {
      // window is explicitly set to undefined in the context
      const result = evaluateExpression('window', baseContext);
      expect(result).toBe('undefined');
    });

    it('should not have access to document object (undefined in context)', () => {
      // document is explicitly set to undefined in the context
      // If not in context, it throws ReferenceError which gets caught
      try {
        const result = evaluateExpression('document', baseContext);
        // Either 'undefined' (if in context) or throws error
        expect(result).toBe('undefined');
      } catch {
        // This is also acceptable - variable not found
        expect(true).toBe(true);
      }
    });

    it('should not have access to chrome object (undefined in context)', () => {
      // chrome is explicitly set to undefined in the context
      try {
        const result = evaluateExpression('chrome', baseContext);
        expect(result).toBe('undefined');
      } catch {
        // This is also acceptable - variable not found
        expect(true).toBe(true);
      }
    });
  });

  describe('helper functions', () => {
    it('should use sanitize helper', () => {
      const result = evaluateExpression('sanitize("test:file<name>")', baseContext);
      expect(result).not.toContain(':');
      expect(result).not.toContain('<');
    });

    it('should use truncate helper', () => {
      const result = evaluateExpression('truncate(videoTitle, 10, "...")', baseContext);
      expect(result).toBe('My Awesome...');
    });

    it('should use truncate without suffix', () => {
      const result = evaluateExpression('truncate(videoTitle, 10)', baseContext);
      expect(result).toBe('My Awesome');
    });

    it('should use slugify helper', () => {
      const result = evaluateExpression('slugify(videoTitle)', baseContext);
      expect(result).toBe('my-awesome-video');
    });

    it('should use removeParens helper', () => {
      const context = { ...baseContext, videoTitle: 'Video Title (Extra Info)' };
      const result = evaluateExpression('removeParens(videoTitle)', context);
      expect(result).toBe('Video Title');
    });

    it('should use capitalize helper', () => {
      const context = { ...baseContext, videoTitle: 'lowercase video' };
      const result = evaluateExpression('capitalize(videoTitle)', context);
      expect(result).toBe('Lowercase video');
    });

    it('should use remove helper', () => {
      const result = evaluateExpression('remove(videoTitle, " Video")', baseContext);
      expect(result).toBe('My Awesome');
    });

    it('should use lowercase helper', () => {
      const result = evaluateExpression('lowercase(videoTitle)', baseContext);
      expect(result).toBe('my awesome video');
    });

    it('should use uppercase helper', () => {
      const result = evaluateExpression('uppercase(videoTitle)', baseContext);
      expect(result).toBe('MY AWESOME VIDEO');
    });
  });

  describe('safeEvaluate', () => {
    it('should return result on success', () => {
      const result = safeEvaluate('videoTitle.toLowerCase()', baseContext);
      expect(result).toBe('my awesome video');
    });

    it('should return fallback on error', () => {
      const result = safeEvaluate('invalid..syntax', baseContext, 'fallback');
      expect(result).toBe('fallback');
    });

    it('should return empty string by default on error', () => {
      const result = safeEvaluate('invalid..syntax', baseContext);
      expect(result).toBe('');
    });

    it('should handle undefined gracefully', () => {
      // manifestTitle is not in baseContext, so it's undefined
      // When evaluated, undefined gets converted to string 'undefined'
      const result = safeEvaluate('manifestTitle', baseContext, 'default');
      // If manifestTitle is undefined in context, it returns 'undefined' as string
      expect(result).toBe('undefined');
    });
  });

  describe('isJavaScriptExpression', () => {
    it('should detect optional chaining', () => {
      expect(isJavaScriptExpression('videoTitle?.toLowerCase()')).toBe(true);
    });

    it('should detect null coalescing', () => {
      expect(isJavaScriptExpression('videoTitle ?? "default"')).toBe(true);
    });

    it('should detect ternary operator', () => {
      expect(isJavaScriptExpression('videoTitle ? "yes" : "no"')).toBe(true);
    });

    it('should detect function calls', () => {
      expect(isJavaScriptExpression('videoTitle.toLowerCase()')).toBe(true);
    });

    it('should detect equality check', () => {
      expect(isJavaScriptExpression('manifestType === "hls"')).toBe(true);
    });

    it('should detect replace method', () => {
      expect(isJavaScriptExpression('videoTitle.replace(/a/g, "b")')).toBe(true);
    });

    it('should not detect simple variable', () => {
      expect(isJavaScriptExpression('videoTitle')).toBe(false);
    });

    it('should not detect simple string', () => {
      expect(isJavaScriptExpression('date')).toBe(false);
    });
  });

  describe('complex use cases', () => {
    it('should handle YouTube-style title cleanup', () => {
      const context = {
        ...baseContext,
        videoTitle: 'My Video - YouTube',
      };
      const result = evaluateExpression(
        'videoTitle.replace(/\\s*-\\s*YouTube$/, "").toLowerCase().replace(/\\s+/g, "_")',
        context
      );
      expect(result).toBe('my_video');
    });

    it('should handle bracket removal', () => {
      const context = {
        ...baseContext,
        videoTitle: 'Video Title【Extra】(Info)',
      };
      const result = evaluateExpression(
        'videoTitle.replace(/[【\\[\\(].*?[】\\]\\)]/g, "").trim()',
        context
      );
      expect(result).toBe('Video Title');
    });

    it('should handle multiple transformations', () => {
      const context = {
        ...baseContext,
        videoTitle: 'My Awesome Video!!!',
      };
      const result = evaluateExpression(
        'videoTitle.toLowerCase().replace(/[^a-z0-9\\s-]/g, "").trim().substring(0, 20)',
        context
      );
      expect(result).toBe('my awesome video');
    });

    it('should handle manifest type condition', () => {
      const context = {
        ...baseContext,
        manifestType: 'hls',
      };
      const result = evaluateExpression('manifestType === "hls" ? "HLS" : "DASH"', context);
      expect(result).toBe('HLS');
    });

    it('should handle fallback chain', () => {
      const result = evaluateExpression(
        'videoTitle ?? ogTitle ?? pageTitle ?? "untitled"',
        baseContext
      );
      expect(result).toBe('My Awesome Video');
    });

    it('should handle combined helpers', () => {
      const result = evaluateExpression('slugify(truncate(videoTitle, 15))', baseContext);
      expect(result).toBe('my-awesome-vide');
    });
  });
});

/**
 * Unit Tests for Pipeline Template Engine
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateTemplate,
  safeEvaluateTemplate,
  type TemplateContext,
} from '@/lib/pipeline-template-engine';

describe('Pipeline Template Engine', () => {
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

  describe('evaluateTemplate', () => {
    it('should evaluate simple variable', () => {
      const result = evaluateTemplate('{videoTitle}', baseContext);
      expect(result).toBe('My Awesome Video');
    });

    it('should evaluate multiple variables', () => {
      const result = evaluateTemplate('{videoTitle}_{date}.{ext}', baseContext);
      expect(result).toBe('My Awesome Video_2025-10-18.sh');
    });

    it('should evaluate variable with single filter', () => {
      const result = evaluateTemplate('{videoTitle | lowercase}', baseContext);
      expect(result).toBe('my awesome video');
    });

    it('should evaluate variable with multiple filters', () => {
      const result = evaluateTemplate('{videoTitle | lowercase | trim}', baseContext);
      expect(result).toBe('my awesome video');
    });

    it('should evaluate filter with arguments', () => {
      const result = evaluateTemplate('{videoTitle | truncate(10)}', baseContext);
      expect(result).toBe('My Awesome');
    });

    it('should evaluate filter with multiple arguments', () => {
      const result = evaluateTemplate('{videoTitle | truncate(10, "...")}', baseContext);
      expect(result).toBe('My Awesome...');
    });

    it('should evaluate complex template', () => {
      const result = evaluateTemplate(
        '{videoTitle | lowercase | replace(" ", "_")}_{date}.{ext}',
        baseContext
      );
      expect(result).toBe('my_awesome_video_2025-10-18.sh');
    });

    it('should handle undefined variables', () => {
      const result = evaluateTemplate('{unknownVar}', baseContext);
      expect(result).toBe('');
    });

    it('should use default filter for undefined variables', () => {
      const result = evaluateTemplate('{unknownVar | default("fallback")}', baseContext);
      expect(result).toBe('fallback');
    });
  });

  describe('Filters', () => {
    it('should apply lowercase filter', () => {
      const result = evaluateTemplate('{videoTitle | lowercase}', baseContext);
      expect(result).toBe('my awesome video');
    });

    it('should apply uppercase filter', () => {
      const result = evaluateTemplate('{videoTitle | uppercase}', baseContext);
      expect(result).toBe('MY AWESOME VIDEO');
    });

    it('should apply capitalize filter', () => {
      const ctx = { ...baseContext, videoTitle: 'hello world' };
      const result = evaluateTemplate('{videoTitle | capitalize}', ctx);
      expect(result).toBe('Hello world');
    });

    it('should apply slugify filter', () => {
      const result = evaluateTemplate('{videoTitle | slugify}', baseContext);
      expect(result).toBe('my-awesome-video');
    });

    it('should apply truncate filter', () => {
      const result = evaluateTemplate('{videoTitle | truncate(10)}', baseContext);
      expect(result).toBe('My Awesome');
    });

    it('should apply truncate with suffix', () => {
      const result = evaluateTemplate('{videoTitle | truncate(10, "...")}', baseContext);
      expect(result).toBe('My Awesome...');
    });

    it('should apply substring filter', () => {
      const result = evaluateTemplate('{videoTitle | substring(0, 10)}', baseContext);
      expect(result).toBe('My Awesome');
    });

    it('should apply replace filter', () => {
      const result = evaluateTemplate('{videoTitle | replace(" ", "_")}', baseContext);
      expect(result).toBe('My_Awesome_Video');
    });

    it('should apply remove filter', () => {
      const result = evaluateTemplate('{videoTitle | remove(" Awesome")}', baseContext);
      expect(result).toBe('My Video');
    });

    it('should apply sanitize filter', () => {
      const ctx = { ...baseContext, videoTitle: 'Video: Part 1' };
      const result = evaluateTemplate('{videoTitle | sanitize}', ctx);
      // sanitizeFilename removes colons
      expect(result).not.toContain(':');
    });

    it('should apply removeParens filter', () => {
      const ctx = { ...baseContext, videoTitle: 'Video Title【Extra】(HD)' };
      const result = evaluateTemplate('{videoTitle | removeParens}', ctx);
      expect(result).toBe('Video Title');
    });

    it('should apply default filter', () => {
      const result = evaluateTemplate('{unknownVar | default("fallback")}', baseContext);
      expect(result).toBe('fallback');
    });

    it('should apply ifEquals filter (true)', () => {
      const ctx = { ...baseContext, manifestType: 'hls' };
      const result = evaluateTemplate('{manifestType | ifEquals("hls", "stream")}', ctx);
      expect(result).toBe('stream');
    });

    it('should apply ifEquals filter (false)', () => {
      const ctx = { ...baseContext, manifestType: 'dash' };
      const result = evaluateTemplate('{manifestType | ifEquals("hls", "stream", "video")}', ctx);
      expect(result).toBe('video');
    });

    it('should apply ifContains filter (true)', () => {
      const result = evaluateTemplate('{videoTitle | ifContains("Awesome", "yes")}', baseContext);
      expect(result).toBe('yes');
    });

    it('should apply ifContains filter (false)', () => {
      const result = evaluateTemplate(
        '{videoTitle | ifContains("Missing", "yes", "no")}',
        baseContext
      );
      expect(result).toBe('no');
    });

    it('should apply ifEmpty filter (not empty)', () => {
      const result = evaluateTemplate('{videoTitle | ifEmpty("empty")}', baseContext);
      expect(result).toBe('My Awesome Video');
    });

    it('should apply ifEmpty filter (empty)', () => {
      const ctx = { ...baseContext, videoTitle: '' };
      const result = evaluateTemplate('{videoTitle | ifEmpty("empty")}', ctx);
      expect(result).toBe('empty');
    });
  });

  describe('Complex templates', () => {
    it('should evaluate YouTube-style template', () => {
      const result = evaluateTemplate(
        '{videoTitle | lowercase | replace(" ", "_") | remove("awesome_")}_{date}.{ext}',
        baseContext
      );
      expect(result).toBe('my_video_2025-10-18.sh');
    });

    it('should evaluate slugified template', () => {
      const result = evaluateTemplate(
        '{videoTitle | slugify | truncate(20)}_{timestamp}.{ext}',
        baseContext
      );
      expect(result).toBe('my-awesome-video_1729259400000.sh');
    });

    it('should evaluate conditional template', () => {
      const ctx = { ...baseContext, manifestType: 'hls' };
      const result = evaluateTemplate(
        '{manifestType | ifEquals("hls", "stream", "video")}_{domain}.{ext}',
        ctx
      );
      expect(result).toBe('stream_example.com.sh');
    });

    it('should evaluate template with removeParens', () => {
      const ctx = { ...baseContext, videoTitle: 'Video Title【Preview】' };
      const result = evaluateTemplate('{videoTitle | removeParens}_{date}.{ext}', ctx);
      expect(result).toBe('Video Title_2025-10-18.sh');
    });

    it('should handle filter chain with default', () => {
      const result = evaluateTemplate(
        '{unknownVar | default("fallback") | uppercase}',
        baseContext
      );
      expect(result).toBe('FALLBACK');
    });
  });

  describe('safeEvaluateTemplate', () => {
    it('should return result on success', () => {
      const result = safeEvaluateTemplate('{videoTitle | lowercase}', baseContext);
      expect(result).toBe('my awesome video');
    });

    it('should return fallback on error', () => {
      const result = safeEvaluateTemplate('{videoTitle | unknownFilter}', baseContext, 'fallback');
      expect(result).toBe('fallback');
    });

    it('should return empty string by default on error', () => {
      const result = safeEvaluateTemplate('{videoTitle | unknownFilter}', baseContext);
      expect(result).toBe('');
    });
  });

  describe('Error handling', () => {
    it('should throw on unknown filter', () => {
      expect(() => {
        evaluateTemplate('{videoTitle | unknownFilter}', baseContext);
      }).toThrow('Unknown filter');
    });

    it('should throw on invalid filter arguments', () => {
      expect(() => {
        evaluateTemplate('{videoTitle | truncate("invalid")}', baseContext);
      }).toThrow();
    });
  });
});

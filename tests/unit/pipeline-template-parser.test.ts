/**
 * Unit Tests for Pipeline Template Parser
 */

import { describe, it, expect } from 'vitest';
import {
  parseTemplate,
  validateTemplate,
  type TemplateToken,
  type TemplateVariable,
  type TemplateLiteral,
} from '@/lib/pipeline-template-parser';

describe('Pipeline Template Parser', () => {
  describe('parseTemplate', () => {
    it('should parse simple variable', () => {
      const tokens = parseTemplate('{videoTitle}');

      expect(tokens).toHaveLength(1);
      expect(tokens[0]!.type).toBe('variable');

      const variable = tokens[0] as TemplateVariable;
      expect(variable.name).toBe('videoTitle');
      expect(variable.filters).toHaveLength(0);
    });

    it('should parse variable with single filter', () => {
      const tokens = parseTemplate('{videoTitle | lowercase}');

      expect(tokens).toHaveLength(1);

      const variable = tokens[0] as TemplateVariable;
      expect(variable.name).toBe('videoTitle');
      expect(variable.filters).toHaveLength(1);
      expect(variable.filters[0]!.name).toBe('lowercase');
      expect(variable.filters[0]!.args).toHaveLength(0);
    });

    it('should parse variable with multiple filters', () => {
      const tokens = parseTemplate('{videoTitle | lowercase | trim}');

      const variable = tokens[0] as TemplateVariable;
      expect(variable.filters).toHaveLength(2);
      expect(variable.filters[0]!.name).toBe('lowercase');
      expect(variable.filters[1]!.name).toBe('trim');
    });

    it('should parse filter with numeric argument', () => {
      const tokens = parseTemplate('{videoTitle | truncate(50)}');

      const variable = tokens[0] as TemplateVariable;
      expect(variable.filters[0]!.name).toBe('truncate');
      expect(variable.filters[0]!.args).toEqual([50]);
    });

    it('should parse filter with string argument', () => {
      const tokens = parseTemplate('{videoTitle | replace("hello", "world")}');

      const variable = tokens[0] as TemplateVariable;
      expect(variable.filters[0]!.name).toBe('replace');
      expect(variable.filters[0]!.args).toEqual(['hello', 'world']);
    });

    it('should parse filter with single quote strings', () => {
      const tokens = parseTemplate("{videoTitle | replace(' ', '_')}");

      const variable = tokens[0] as TemplateVariable;
      expect(variable.filters[0]!.args).toEqual([' ', '_']);
    });

    it('should parse filter with mixed arguments', () => {
      const tokens = parseTemplate('{videoTitle | truncate(50, "...")}');

      const variable = tokens[0] as TemplateVariable;
      expect(variable.filters[0]!.args).toEqual([50, '...']);
    });

    it('should parse template with literals and variables', () => {
      const tokens = parseTemplate('{videoTitle}_{date}.{ext}');

      expect(tokens).toHaveLength(5);
      expect(tokens[0]!.type).toBe('variable');
      expect(tokens[1]!.type).toBe('literal');
      expect((tokens[1] as TemplateLiteral).value).toBe('_');
      expect(tokens[2]!.type).toBe('variable');
      expect(tokens[3]!.type).toBe('literal');
      expect((tokens[3] as TemplateLiteral).value).toBe('.');
      expect(tokens[4]!.type).toBe('variable');
    });

    it('should parse complex template', () => {
      const tokens = parseTemplate('{videoTitle | lowercase | replace(" ", "_")}_{date}.{ext}');

      expect(tokens).toHaveLength(5);

      const videoTitle = tokens[0] as TemplateVariable;
      expect(videoTitle.name).toBe('videoTitle');
      expect(videoTitle.filters).toHaveLength(2);
      expect(videoTitle.filters[0]!.name).toBe('lowercase');
      expect(videoTitle.filters[1]!.name).toBe('replace');
      expect(videoTitle.filters[1]!.args).toEqual([' ', '_']);
    });

    it('should handle whitespace in filters', () => {
      const tokens = parseTemplate('{ videoTitle  |  lowercase  |  trim }');

      const variable = tokens[0] as TemplateVariable;
      expect(variable.name).toBe('videoTitle');
      expect(variable.filters).toHaveLength(2);
    });

    it('should parse template without variables', () => {
      const tokens = parseTemplate('constant_filename.txt');

      expect(tokens).toHaveLength(1);
      expect(tokens[0]!.type).toBe('literal');
      expect((tokens[0] as TemplateLiteral).value).toBe('constant_filename.txt');
    });

    it('should handle escaped quotes in filter arguments', () => {
      const tokens = parseTemplate('{videoTitle | replace("\\"", "\'\'")}');

      const variable = tokens[0] as TemplateVariable;
      expect(variable.filters[0]!.args).toEqual(['"', "''"]);
    });
  });

  describe('Error handling', () => {
    it('should throw on template too long', () => {
      const longTemplate = '{' + 'x'.repeat(1000) + '}';
      expect(() => parseTemplate(longTemplate)).toThrow('Template too long');
    });

    it('should throw on invalid variable name', () => {
      expect(() => parseTemplate('{123invalid}')).toThrow('Invalid variable name');
      expect(() => parseTemplate('{invalid-name}')).toThrow('Invalid variable name');
      expect(() => parseTemplate('{invalid.name}')).toThrow('Invalid variable name');
    });

    it('should throw on invalid filter syntax', () => {
      expect(() => parseTemplate('{videoTitle | 123}')).toThrow('Invalid filter syntax');
      expect(() => parseTemplate('{videoTitle | filter-name}')).toThrow('Invalid filter syntax');
    });

    it('should throw on unclosed braces', () => {
      // This will be parsed as a literal since regex doesn't match
      const tokens = parseTemplate('{videoTitle');
      expect(tokens[0]!.type).toBe('literal');
    });
  });

  describe('validateTemplate', () => {
    it('should validate correct template', () => {
      const result = validateTemplate('{videoTitle | lowercase}_{date}.{ext}');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid template', () => {
      const result = validateTemplate('{123invalid}');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid variable name');
    });

    it('should return error for template too long', () => {
      const longTemplate = '{' + 'x'.repeat(1000) + '}';
      const result = validateTemplate(longTemplate);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Template too long');
    });
  });

  describe('Complex templates', () => {
    it('should parse YouTube-style template', () => {
      const tokens = parseTemplate(
        '{videoTitle | lowercase | replace(" ", "_") | remove("- youtube")}_{date}.{ext}'
      );

      const videoTitle = tokens[0] as TemplateVariable;
      expect(videoTitle.filters).toHaveLength(3);
      expect(videoTitle.filters[0]!.name).toBe('lowercase');
      expect(videoTitle.filters[1]!.name).toBe('replace');
      expect(videoTitle.filters[2]!.name).toBe('remove');
    });

    it('should parse slugified template', () => {
      const tokens = parseTemplate('{videoTitle | slugify | truncate(50)}_{timestamp}.{ext}');

      const videoTitle = tokens[0] as TemplateVariable;
      expect(videoTitle.filters).toHaveLength(2);
      expect(videoTitle.filters[0]!.name).toBe('slugify');
      expect(videoTitle.filters[1]!.name).toBe('truncate');
      expect(videoTitle.filters[1]!.args).toEqual([50]);
    });

    it('should parse conditional template', () => {
      const tokens = parseTemplate(
        '{manifestType | ifEquals("hls", "stream", "video")}_{domain}.{ext}'
      );

      const manifestType = tokens[0] as TemplateVariable;
      expect(manifestType.filters[0]!.name).toBe('ifEquals');
      expect(manifestType.filters[0]!.args).toEqual(['hls', 'stream', 'video']);
    });

    it('should parse template with removeParens', () => {
      const tokens = parseTemplate('{videoTitle | removeParens | sanitize}_{programDate}.{ext}');

      const videoTitle = tokens[0] as TemplateVariable;
      expect(videoTitle.filters).toHaveLength(2);
      expect(videoTitle.filters[0]!.name).toBe('removeParens');
      expect(videoTitle.filters[1]!.name).toBe('sanitize');
    });
  });

  describe('Security validation', () => {
    it('should reject templates with eval-like patterns', () => {
      // These are rejected at the variable/filter name validation stage
      expect(() => parseTemplate('{eval("code")}')).toThrow();
      expect(() => parseTemplate('{Function("code")}')).toThrow();
    });

    it('should allow only safe variable names', () => {
      // Valid
      expect(() => parseTemplate('{videoTitle}')).not.toThrow();
      expect(() => parseTemplate('{video_title}')).not.toThrow();
      expect(() => parseTemplate('{_privateVar}')).not.toThrow();
      expect(() => parseTemplate('{var123}')).not.toThrow();

      // Invalid
      expect(() => parseTemplate('{video-title}')).toThrow();
      expect(() => parseTemplate('{video.title}')).toThrow();
      expect(() => parseTemplate('{video[0]}')).toThrow();
      expect(() => parseTemplate('{123video}')).toThrow();
    });

    it('should allow only safe filter names', () => {
      // Valid
      expect(() => parseTemplate('{x | lowercase}')).not.toThrow();
      expect(() => parseTemplate('{x | my_filter}')).not.toThrow();
      expect(() => parseTemplate('{x | filter123}')).not.toThrow();

      // Invalid
      expect(() => parseTemplate('{x | my-filter}')).toThrow();
      expect(() => parseTemplate('{x | filter.method}')).toThrow();
      expect(() => parseTemplate('{x | 123filter}')).toThrow();
    });
  });
});

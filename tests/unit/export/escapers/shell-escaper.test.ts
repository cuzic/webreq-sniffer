/**
 * Unit Tests for Shell Escaper
 */

import { describe, it, expect } from 'vitest';
import { escapeShellArg } from '@/lib/export/escapers/shell-escaper';

describe('escapeShellArg', () => {
  it('should escape single quotes in Bash', () => {
    expect(escapeShellArg("it's a test")).toBe("'it'\\''s a test'");
  });

  it('should wrap argument in single quotes', () => {
    expect(escapeShellArg('simple')).toBe("'simple'");
  });

  it('should handle special characters', () => {
    expect(escapeShellArg('test$variable')).toBe("'test$variable'");
    expect(escapeShellArg('test`command`')).toBe("'test`command`'");
  });

  it('should handle empty string', () => {
    expect(escapeShellArg('')).toBe("''");
  });

  it('should handle multiple single quotes', () => {
    expect(escapeShellArg("'hello' 'world'")).toBe("''\\''hello'\\'' '\\''world'\\'''");
  });

  it('should preserve whitespace', () => {
    expect(escapeShellArg('test   spaces')).toBe("'test   spaces'");
  });

  it('should handle newlines', () => {
    expect(escapeShellArg('line1\nline2')).toBe("'line1\nline2'");
  });
});

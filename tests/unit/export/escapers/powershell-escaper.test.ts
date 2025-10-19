/**
 * Unit Tests for PowerShell Escaper
 */

import { describe, it, expect } from 'vitest';
import { escapePowerShellArg } from '@/lib/export/escapers/powershell-escaper';

describe('escapePowerShellArg', () => {
  it('should escape backticks', () => {
    expect(escapePowerShellArg('test`quote')).toBe('test``quote');
  });

  it('should escape dollar signs', () => {
    expect(escapePowerShellArg('test$variable')).toBe('test`$variable');
  });

  it('should escape double quotes', () => {
    expect(escapePowerShellArg('test"quote')).toBe('test`"quote');
  });

  it('should escape newlines and carriage returns', () => {
    expect(escapePowerShellArg('test\nline')).toBe('test`nline');
    expect(escapePowerShellArg('test\rreturn')).toBe('test`rreturn');
  });

  it('should handle empty string', () => {
    expect(escapePowerShellArg('')).toBe('');
  });

  it('should handle multiple special characters', () => {
    expect(escapePowerShellArg('test$var`cmd"quote')).toBe('test`$var``cmd`"quote');
  });

  it('should preserve other characters', () => {
    expect(escapePowerShellArg('simple text')).toBe('simple text');
  });

  it('should handle all escape chars together', () => {
    expect(escapePowerShellArg('`$"\n\r')).toBe('```$`"`n`r');
  });
});

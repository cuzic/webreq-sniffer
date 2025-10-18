/**
 * Unit Tests for Custom Error Classes
 * TDD approach for unified error handling
 */

import { describe, it, expect } from 'vitest';
import {
  WebreqSnifferError,
  StorageError,
  FilterError,
  ValidationError,
  ExportError,
} from '@/lib/errors';

describe('Custom Error Classes', () => {
  describe('WebreqSnifferError', () => {
    it('should create error with message and code', () => {
      const error = new WebreqSnifferError('Test error', 'TEST_ERROR');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(WebreqSnifferError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('WebreqSnifferError');
    });

    it('should include optional details', () => {
      const details = { url: 'https://example.com', status: 404 };
      const error = new WebreqSnifferError('Not found', 'NOT_FOUND', details);

      expect(error.details).toEqual(details);
    });

    it('should be catchable as Error', () => {
      try {
        throw new WebreqSnifferError('Test', 'TEST');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should have stack trace', () => {
      const error = new WebreqSnifferError('Test', 'TEST');
      expect(error.stack).toBeDefined();
    });
  });

  describe('StorageError', () => {
    it('should extend WebreqSnifferError', () => {
      const error = new StorageError('Storage failed');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(WebreqSnifferError);
      expect(error).toBeInstanceOf(StorageError);
    });

    it('should have correct code and name', () => {
      const error = new StorageError('Storage failed');

      expect(error.code).toBe('STORAGE_ERROR');
      expect(error.name).toBe('StorageError');
      expect(error.message).toBe('Storage failed');
    });

    it('should include details', () => {
      const details = { key: 'settings', operation: 'get' };
      const error = new StorageError('Failed to get settings', details);

      expect(error.details).toEqual(details);
    });

    it('should be distinguishable with instanceof', () => {
      const error = new StorageError('Test');

      expect(error instanceof StorageError).toBe(true);
      expect(error instanceof FilterError).toBe(false);
    });
  });

  describe('FilterError', () => {
    it('should extend WebreqSnifferError', () => {
      const error = new FilterError('Invalid filter');

      expect(error).toBeInstanceOf(WebreqSnifferError);
      expect(error).toBeInstanceOf(FilterError);
    });

    it('should have correct code and name', () => {
      const error = new FilterError('Invalid regex pattern');

      expect(error.code).toBe('FILTER_ERROR');
      expect(error.name).toBe('FilterError');
    });

    it('should include invalid pattern in details', () => {
      const details = { pattern: '[invalid', error: 'Invalid regex' };
      const error = new FilterError('Invalid regex pattern', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('ValidationError', () => {
    it('should extend WebreqSnifferError', () => {
      const error = new ValidationError('Validation failed');

      expect(error).toBeInstanceOf(WebreqSnifferError);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should have correct code and name', () => {
      const error = new ValidationError('Invalid settings');

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('should include validation errors in details', () => {
      const details = {
        field: 'maxEntries',
        value: -1,
        constraint: 'must be positive',
      };
      const error = new ValidationError('Invalid maxEntries', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('ExportError', () => {
    it('should extend WebreqSnifferError', () => {
      const error = new ExportError('Export failed');

      expect(error).toBeInstanceOf(WebreqSnifferError);
      expect(error).toBeInstanceOf(ExportError);
    });

    it('should have correct code and name', () => {
      const error = new ExportError('No entries to export');

      expect(error.code).toBe('EXPORT_ERROR');
      expect(error.name).toBe('ExportError');
    });

    it('should include export details', () => {
      const details = { format: 'bash-curl', entryCount: 0 };
      const error = new ExportError('No entries to export', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('Error Handling Patterns', () => {
    it('should allow specific error handling', () => {
      try {
        throw new StorageError('Storage failed');
      } catch (error) {
        if (error instanceof StorageError) {
          expect(error.code).toBe('STORAGE_ERROR');
          expect(error.message).toBe('Storage failed');
        } else {
          throw new Error('Should catch as StorageError');
        }
      }
    });

    it('should allow generic WebreqSnifferError handling', () => {
      const errors = [
        new StorageError('Storage'),
        new FilterError('Filter'),
        new ValidationError('Validation'),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(WebreqSnifferError);
        expect(error.code).toBeDefined();
        expect(error.name).toBeDefined();
      });
    });

    it('should preserve original error in details', () => {
      const originalError = new Error('Original error');
      const wrappedError = new StorageError('Wrapped error', {
        cause: originalError,
      });

      expect(wrappedError.details).toEqual({ cause: originalError });
    });

    it('should allow error chaining', () => {
      try {
        try {
          throw new Error('Low level error');
        } catch (lowLevelError) {
          throw new StorageError('Storage operation failed', {
            cause: lowLevelError,
          });
        }
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        if (error instanceof StorageError) {
          expect(error.details).toHaveProperty('cause');
          expect((error.details as any).cause.message).toBe('Low level error');
        }
      }
    });
  });

  describe('Error Serialization', () => {
    it('should serialize to JSON with all properties', () => {
      const error = new StorageError('Test error', { key: 'test' });
      const serialized = {
        name: error.name,
        message: error.message,
        code: error.code,
        details: error.details,
      };

      expect(serialized).toEqual({
        name: 'StorageError',
        message: 'Test error',
        code: 'STORAGE_ERROR',
        details: { key: 'test' },
      });
    });
  });
});

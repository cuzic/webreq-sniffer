/**
 * Custom Error Classes
 * Provides unified error handling across the application
 */

/**
 * Base error class for WebreqSniffer
 * All custom errors should extend this class
 */
export class WebreqSnifferError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'WebreqSnifferError';

    // Maintains proper stack trace for where error was thrown (V8 only)
    if ('captureStackTrace' in Error) {
      const ErrorConstructor = Error as typeof Error & {
        captureStackTrace(targetObject: object, constructorOpt?: new (...args: any[]) => any): void;
      };
      ErrorConstructor.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Storage-related errors
 * Thrown when chrome.storage operations fail
 */
export class StorageError extends WebreqSnifferError {
  constructor(message: string, details?: unknown) {
    super(message, 'STORAGE_ERROR', details);
    this.name = 'StorageError';
  }
}

/**
 * Filter-related errors
 * Thrown when URL/request filtering fails
 */
export class FilterError extends WebreqSnifferError {
  constructor(message: string, details?: unknown) {
    super(message, 'FILTER_ERROR', details);
    this.name = 'FilterError';
  }
}

/**
 * Validation errors
 * Thrown when data validation fails
 */
export class ValidationError extends WebreqSnifferError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Export-related errors
 * Thrown when log export operations fail
 */
export class ExportError extends WebreqSnifferError {
  constructor(message: string, details?: unknown) {
    super(message, 'EXPORT_ERROR', details);
    this.name = 'ExportError';
  }
}

/**
 * Type guard to check if error is a WebreqSnifferError
 */
export function isWebreqSnifferError(error: unknown): error is WebreqSnifferError {
  return error instanceof WebreqSnifferError;
}

/**
 * Type guard to check if error is a StorageError
 */
export function isStorageError(error: unknown): error is StorageError {
  return error instanceof StorageError;
}

/**
 * Type guard to check if error is a FilterError
 */
export function isFilterError(error: unknown): error is FilterError {
  return error instanceof FilterError;
}

/**
 * Type guard to check if error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard to check if error is an ExportError
 */
export function isExportError(error: unknown): error is ExportError {
  return error instanceof ExportError;
}

/**
 * Format error for logging
 * @param error Error to format
 * @returns Formatted error string
 */
export function formatError(error: unknown): string {
  if (isWebreqSnifferError(error)) {
    const parts = [`[${error.code}] ${error.message}`];
    if (error.details) {
      parts.push(`Details: ${JSON.stringify(error.details)}`);
    }
    return parts.join(' ');
  }

  if (error instanceof Error) {
    return `[ERROR] ${error.message}`;
  }

  return `[UNKNOWN_ERROR] ${String(error)}`;
}

/**
 * Serialize error to JSON-safe object
 * @param error Error to serialize
 * @returns JSON-safe error object
 */
export function serializeError(error: unknown): {
  name: string;
  message: string;
  code?: string;
  details?: unknown;
  stack?: string;
} {
  if (isWebreqSnifferError(error)) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: 'UnknownError',
    message: String(error),
  };
}

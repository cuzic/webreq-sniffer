/**
 * Error Handling Utilities
 * Provides unified error handling across the application
 */

import { toast } from 'sonner';

/**
 * Custom application error with context
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Handle and display errors appropriately
 * Logs to console and shows toast notification
 */
export function handleError(error: unknown, userMessage?: string): void {
  console.error('Error occurred:', error);

  if (error instanceof AppError) {
    // Application error with context
    if (error.context) {
      console.error('Error context:', error.context);
    }
    toast.error(userMessage || error.message);
  } else if (error instanceof Error) {
    // Standard JavaScript error
    toast.error(userMessage || 'エラーが発生しました');
  } else {
    // Unknown error type
    toast.error('不明なエラーが発生しました');
  }
}

/**
 * Wrap async operations with error handling
 * Returns result on success, null on error
 *
 * @example
 * const result = await tryCatch(
 *   () => navigator.clipboard.writeText(url),
 *   'URLのコピーに失敗しました'
 * );
 * if (result !== null) {
 *   toast.success('URLをコピーしました');
 * }
 */
export async function tryCatch<T>(fn: () => Promise<T>, errorMessage: string): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, errorMessage);
    return null;
  }
}

/**
 * Wrap sync operations with error handling
 * Returns result on success, null on error
 */
export function tryCatchSync<T>(fn: () => T, errorMessage: string): T | null {
  try {
    return fn();
  } catch (error) {
    handleError(error, errorMessage);
    return null;
  }
}

/**
 * Check if error is an AppError with specific code
 */
export function isAppError(error: unknown, code?: string): error is AppError {
  if (!(error instanceof AppError)) {
    return false;
  }
  if (code !== undefined) {
    return error.code === code;
  }
  return true;
}

/**
 * Common error codes
 */
export const ErrorCode = {
  CLIPBOARD_FAILED: 'CLIPBOARD_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
  STORAGE_FAILED: 'STORAGE_FAILED',
  NETWORK_FAILED: 'NETWORK_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

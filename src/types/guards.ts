/**
 * Type Guards for Runtime Type Checking
 * These functions help with type narrowing at runtime
 */

import type { Settings, LogEntry, LogData, ExportFormat, MessageType } from './models';
import {
  settingsSchema,
  logEntrySchema,
  logDataSchema,
  exportFormatSchema,
  messageTypeSchema,
} from './schemas';
import { ValidationError } from '@/lib/errors';

/**
 * Type guard to check if a value is a valid Settings object
 */
export function isSettings(value: unknown): value is Settings {
  return settingsSchema.safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid LogEntry
 */
export function isLogEntry(value: unknown): value is LogEntry {
  return logEntrySchema.safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid LogData
 */
export function isLogData(value: unknown): value is LogData {
  return logDataSchema.safeParse(value).success;
}

/**
 * Type guard to check if a string is a valid ExportFormat
 */
export function isExportFormat(value: unknown): value is ExportFormat {
  return exportFormatSchema.safeParse(value).success;
}

/**
 * Type guard to check if a string is a valid MessageType
 */
export function isMessageType(value: unknown): value is MessageType {
  return messageTypeSchema.safeParse(value).success;
}

/**
 * Validates and parses Settings with detailed error information
 * @throws {ValidationError} if validation fails
 */
export function validateSettings(value: unknown): Settings {
  const result = settingsSchema.safeParse(value);
  if (!result.success) {
    throw new ValidationError('Invalid Settings', {
      issues: result.error.issues,
    });
  }
  return result.data;
}

/**
 * Validates and parses LogEntry with detailed error information
 * @throws {ValidationError} if validation fails
 */
export function validateLogEntry(value: unknown): LogEntry {
  const result = logEntrySchema.safeParse(value);
  if (!result.success) {
    throw new ValidationError('Invalid LogEntry', {
      issues: result.error.issues,
    });
  }
  return result.data;
}

/**
 * Validates and parses LogData with detailed error information
 * @throws {ValidationError} if validation fails
 */
export function validateLogData(value: unknown): LogData {
  const result = logDataSchema.safeParse(value);
  if (!result.success) {
    throw new ValidationError('Invalid LogData', {
      issues: result.error.issues,
    });
  }
  return result.data;
}

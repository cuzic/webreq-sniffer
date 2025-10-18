/**
 * Zod Schema Definitions for Runtime Validation
 * These schemas mirror the TypeScript types in models.ts
 */

import { z } from 'zod';
import { STORAGE, EXPORT } from '@/lib/constants';

// ========================================
// Settings Schemas
// ========================================

export const presetsSchema = z.object({
  video: z.boolean(),
  document: z.boolean(),
  image: z.boolean(),
});

export const headerPolicySchema = z.object({
  basic: z.boolean(),
  sensitiveEnabled: z.boolean(),
});

export const limitsSchema = z.object({
  maxEntries: z.number().int().positive(),
});

export const newlineSchema = z.enum(['LF', 'CRLF']);

export const exportTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  template: z.string().min(1),
  fileExtension: z.string(),
  isBuiltIn: z.boolean(),
  description: z.string().optional(),
});

export const exportSettingsSchema = z.object({
  filenameTemplate: z.string().min(1),
  newline: newlineSchema,
  customTemplates: z.array(exportTemplateSchema),
  defaultTemplateId: z.string(),
});

export const uiSettingsSchema = z.object({
  showBadge: z.boolean(),
});

export const targetScopeSchema = z.enum(['activeTab', 'allTabs']);

export const hlsMpdModeSchema = z.enum(['playlistOnly', 'all']);

export const customPresetSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  icon: z.string().optional(),
  simpleFilters: z.array(z.string()),
  regexFilters: z.array(z.string()),
  resourceTypes: z.array(z.string()),
  allowList: z.array(z.string()),
  denyList: z.array(z.string()),
  hlsMpdMode: hlsMpdModeSchema,
});

export const settingsSchema = z.object({
  targetScope: targetScopeSchema,
  presets: presetsSchema,
  simpleFilters: z.array(z.string()),
  regexFilters: z.array(z.string()),
  resourceTypes: z.array(z.string()),
  allowList: z.array(z.string()),
  denyList: z.array(z.string()),
  headerPolicy: headerPolicySchema,
  hlsMpdMode: hlsMpdModeSchema,
  limits: limitsSchema,
  exportSettings: exportSettingsSchema,
  ui: uiSettingsSchema,
  customPresets: z.array(customPresetSchema),
});

// ========================================
// Log Entry Schemas
// ========================================

export const logHeadersSchema = z
  .object({
    'User-Agent': z.string().optional(),
    Referer: z.string().optional(),
    Origin: z.string().optional(),
  })
  .optional();

export const logEntrySchema = z.object({
  id: z.string(),
  requestId: z.string(),
  url: z.string().url(),
  method: z.string(),
  type: z.string(),
  tabId: z.number().int(),
  frameId: z.number().int(),
  timestamp: z.number().int().positive(),
  initiator: z.string().optional(),
  headers: logHeadersSchema,
  dedupeKey: z.string(),
});

// ========================================
// Log Data Schema
// ========================================

export const monitoringScopeSchema = z.enum(['activeTab', 'allTabs']);

export const logDataSchema = z.object({
  isMonitoring: z.boolean(),
  monitoringScope: monitoringScopeSchema,
  activeTabId: z.number().int().optional(),
  entries: z.array(logEntrySchema),
});

// ========================================
// Export Format Schemas
// ========================================

export const exportFormatSchema = z.enum([
  'url-list',
  'bash-curl',
  'bash-curl-headers',
  'bash-yt-dlp',
  'powershell',
]);

export const exportOptionsSchema = z.object({
  format: exportFormatSchema,
  includeHeaders: z.boolean(),
  filename: z.string().optional(),
});

// ========================================
// Message Schemas
// ========================================

export const messageTypeSchema = z.enum([
  'start-monitoring',
  'stop-monitoring',
  'get-status',
  'export-logs',
  'clear-logs',
  'get-settings',
  'update-settings',
]);

export const messageSchema = z.object({
  type: messageTypeSchema,
  payload: z.unknown().optional(),
});

export const messageResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

// ========================================
// Default Values
// ========================================

export const defaultSettings: z.infer<typeof settingsSchema> = {
  targetScope: 'activeTab',
  presets: {
    video: false,
    document: false,
    image: false,
  },
  simpleFilters: [],
  regexFilters: [],
  resourceTypes: [],
  allowList: [],
  denyList: [],
  headerPolicy: {
    basic: true,
    sensitiveEnabled: false,
  },
  hlsMpdMode: 'playlistOnly',
  limits: {
    maxEntries: STORAGE.DEFAULT_MAX_ENTRIES,
  },
  exportSettings: {
    filenameTemplate: EXPORT.DEFAULT_FILENAME_TEMPLATE,
    newline: 'LF',
    customTemplates: [],
    defaultTemplateId: 'url-list',
  },
  ui: {
    showBadge: true,
  },
  customPresets: [],
};

export const defaultLogData: z.infer<typeof logDataSchema> = {
  isMonitoring: false,
  monitoringScope: 'activeTab',
  entries: [],
};

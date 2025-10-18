/**
 * Unit Tests for Schema Validation
 */

import { describe, it, expect } from 'vitest';
import {
  settingsSchema,
  logEntrySchema,
  logDataSchema,
  exportFormatSchema,
  defaultSettings,
  defaultLogData,
} from '@/types/schemas';
import { isSettings, validateSettings, isLogEntry, validateLogEntry } from '@/types/guards';

describe('Schema Validation', () => {
  describe('settingsSchema', () => {
    it('should validate valid settings', () => {
      const result = settingsSchema.safeParse(defaultSettings);
      expect(result.success).toBe(true);
    });

    it('should reject invalid targetScope', () => {
      const invalid = { ...defaultSettings, targetScope: 'invalid' };
      const result = settingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate simpleFilters array', () => {
      const valid = { ...defaultSettings, simpleFilters: ['.m3u8', '.mpd'] };
      const result = settingsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should validate hlsMpdMode enum', () => {
      const playlistOnly = { ...defaultSettings, hlsMpdMode: 'playlistOnly' };
      const all = { ...defaultSettings, hlsMpdMode: 'all' };
      expect(settingsSchema.safeParse(playlistOnly).success).toBe(true);
      expect(settingsSchema.safeParse(all).success).toBe(true);

      const invalid = { ...defaultSettings, hlsMpdMode: 'invalid' };
      expect(settingsSchema.safeParse(invalid).success).toBe(false);
    });

    it('should validate headerPolicy structure', () => {
      const valid = {
        ...defaultSettings,
        headerPolicy: {
          basic: true,
          sensitiveEnabled: false,
        },
      };
      const result = settingsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should validate limits structure', () => {
      const valid = {
        ...defaultSettings,
        limits: {
          maxEntries: 5000,
        },
      };
      const result = settingsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalid = {
        targetScope: 'all',
        // Missing many required fields
      };
      const result = settingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('logEntrySchema', () => {
    const validEntry = {
      id: 'test-id',
      requestId: 'req-123',
      url: 'https://example.com/video.m3u8',
      method: 'GET',
      type: 'media',
      tabId: 1,
      frameId: 0,
      timestamp: Date.now(),
      dedupeKey: 'dedupe-key',
    };

    it('should validate valid log entry', () => {
      const result = logEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should validate entry with optional fields', () => {
      const withOptionals = {
        ...validEntry,
        initiator: 'https://example.com',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: 'https://example.com',
        },
      };
      const result = logEntrySchema.safeParse(withOptionals);
      expect(result.success).toBe(true);
    });

    it('should reject entry with missing required fields', () => {
      const invalid = {
        id: 'test-id',
        // Missing required fields
      };
      const result = logEntrySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate headers structure', () => {
      const withHeaders = {
        ...validEntry,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: 'https://example.com',
          Origin: 'https://example.com',
        },
      };
      const result = logEntrySchema.safeParse(withHeaders);
      expect(result.success).toBe(true);
    });
  });

  describe('logDataSchema', () => {
    it('should validate valid log data', () => {
      const result = logDataSchema.safeParse(defaultLogData);
      expect(result.success).toBe(true);
    });

    it('should validate with active tab ID', () => {
      const withTabId = {
        ...defaultLogData,
        isMonitoring: true,
        monitoringScope: 'activeTab' as const,
        activeTabId: 123,
      };
      const result = logDataSchema.safeParse(withTabId);
      expect(result.success).toBe(true);
    });

    it('should validate with entries', () => {
      const withEntries = {
        ...defaultLogData,
        entries: [
          {
            id: 'test-id',
            requestId: 'req-123',
            url: 'https://example.com/test',
            method: 'GET',
            type: 'media',
            tabId: 1,
            frameId: 0,
            timestamp: Date.now(),
            dedupeKey: 'key',
          },
        ],
      };
      const result = logDataSchema.safeParse(withEntries);
      expect(result.success).toBe(true);
    });

    it('should reject invalid monitoringScope', () => {
      const invalid = {
        ...defaultLogData,
        monitoringScope: 'invalid',
      };
      const result = logDataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('exportFormatSchema', () => {
    const validFormats = [
      'url-list',
      'bash-curl',
      'bash-curl-headers',
      'bash-yt-dlp',
      'powershell',
    ];

    validFormats.forEach((format) => {
      it(`should validate ${format} format`, () => {
        const result = exportFormatSchema.safeParse(format);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid format', () => {
      const result = exportFormatSchema.safeParse('invalid-format');
      expect(result.success).toBe(false);
    });
  });

  describe('Type Guards', () => {
    describe('isSettings', () => {
      it('should return true for valid settings', () => {
        expect(isSettings(defaultSettings)).toBe(true);
      });

      it('should return false for invalid settings', () => {
        expect(isSettings({})).toBe(false);
        expect(isSettings(null)).toBe(false);
        expect(isSettings(undefined)).toBe(false);
        expect(isSettings('string')).toBe(false);
      });
    });

    describe('validateSettings', () => {
      it('should return settings for valid input', () => {
        const result = validateSettings(defaultSettings);
        expect(result).toEqual(defaultSettings);
      });

      it('should throw error for invalid input', () => {
        expect(() => validateSettings({})).toThrow('Invalid Settings');
        expect(() => validateSettings(null)).toThrow('Invalid Settings');
      });
    });

    describe('isLogEntry', () => {
      const validEntry = {
        id: 'test-id',
        requestId: 'req-123',
        url: 'https://example.com/test',
        method: 'GET',
        type: 'media',
        tabId: 1,
        frameId: 0,
        timestamp: Date.now(),
        dedupeKey: 'key',
      };

      it('should return true for valid log entry', () => {
        expect(isLogEntry(validEntry)).toBe(true);
      });

      it('should return false for invalid log entry', () => {
        expect(isLogEntry({})).toBe(false);
        expect(isLogEntry(null)).toBe(false);
        expect(isLogEntry({ id: 'test' })).toBe(false);
      });
    });

    describe('validateLogEntry', () => {
      const validEntry = {
        id: 'test-id',
        requestId: 'req-123',
        url: 'https://example.com/test',
        method: 'GET',
        type: 'media',
        tabId: 1,
        frameId: 0,
        timestamp: Date.now(),
        dedupeKey: 'key',
      };

      it('should return log entry for valid input', () => {
        const result = validateLogEntry(validEntry);
        expect(result).toEqual(validEntry);
      });

      it('should throw error for invalid input', () => {
        expect(() => validateLogEntry({})).toThrow('Invalid LogEntry');
        expect(() => validateLogEntry(null)).toThrow('Invalid LogEntry');
      });
    });
  });

  describe('Default Values', () => {
    it('defaultSettings should have all required fields', () => {
      expect(defaultSettings.targetScope).toBeDefined();
      expect(defaultSettings.presets).toBeDefined();
      expect(defaultSettings.simpleFilters).toBeDefined();
      expect(defaultSettings.regexFilters).toBeDefined();
      expect(defaultSettings.resourceTypes).toBeDefined();
      expect(defaultSettings.allowList).toBeDefined();
      expect(defaultSettings.denyList).toBeDefined();
      expect(defaultSettings.headerPolicy).toBeDefined();
      expect(defaultSettings.hlsMpdMode).toBeDefined();
      expect(defaultSettings.limits).toBeDefined();
      expect(defaultSettings.exportSettings).toBeDefined();
      expect(defaultSettings.ui).toBeDefined();
    });

    it('defaultLogData should have all required fields', () => {
      expect(defaultLogData.isMonitoring).toBeDefined();
      expect(defaultLogData.monitoringScope).toBeDefined();
      expect(defaultLogData.entries).toBeDefined();
      expect(Array.isArray(defaultLogData.entries)).toBe(true);
    });

    it('defaultSettings should validate against schema', () => {
      const result = settingsSchema.safeParse(defaultSettings);
      expect(result.success).toBe(true);
    });

    it('defaultLogData should validate against schema', () => {
      const result = logDataSchema.safeParse(defaultLogData);
      expect(result.success).toBe(true);
    });
  });
});

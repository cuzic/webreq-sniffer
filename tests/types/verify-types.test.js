/**
 * Type Definitions Verification Test
 * This test verifies that TypeScript types and Zod schemas are properly defined
 */

import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const modelsPath = join(projectRoot, 'src/types/models.ts');
const schemasPath = join(projectRoot, 'src/types/schemas.ts');

// Simple test framework
function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    process.exit(1);
  }
}

function expect(actual) {
  return {
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value but got ${actual}`);
      }
    },
    toBeTypeOf(expectedType) {
      if (typeof actual !== expectedType) {
        throw new Error(`Expected type ${expectedType} but got ${typeof actual}`);
      }
    },
    toHaveProperty(prop) {
      if (!(prop in actual)) {
        throw new Error(`Expected to have property ${prop}`);
      }
    },
    toThrow() {
      let threw = false;
      try {
        actual();
      } catch (e) {
        threw = true;
      }
      if (!threw) {
        throw new Error('Expected function to throw');
      }
    },
  };
}

console.log('Running type definitions verification tests...\n');

// Test 1: Type files exist
test('src/types/models.ts should exist', () => {
  expect(existsSync(modelsPath)).toBeTruthy();
});

test('src/types/schemas.ts should exist', () => {
  expect(existsSync(schemasPath)).toBeTruthy();
});

// Dynamic import tests (will only run after files are created)
let schemas;

async function runSchemaTests() {
  try {
    schemas = await import('../../src/types/schemas.ts');

    // Test 2: Settings schema
    test('settingsSchema should be defined', () => {
      expect(schemas.settingsSchema).toBeTruthy();
    });

    test('settingsSchema should validate valid settings', () => {
      const validSettings = {
        targetScope: 'activeTab',
        presets: { video: true, document: false, image: false },
        simpleFilters: ['.m3u8', '.mpd'],
        regexFilters: [],
        resourceTypes: ['xmlhttprequest', 'media'],
        allowList: [],
        denyList: [],
        headerPolicy: { basic: true, sensitiveEnabled: false },
        hlsMpdMode: 'playlistOnly',
        limits: { maxEntries: 3000 },
        exportSettings: {
          filenameTemplate: 'netlog_{date}_{domain}.{ext}',
          newline: 'LF',
        },
        ui: { showBadge: true },
      };
      const result = schemas.settingsSchema.safeParse(validSettings);
      if (!result.success) {
        throw new Error(`Validation failed: ${JSON.stringify(result.error)}`);
      }
    });

    test('settingsSchema should reject invalid targetScope', () => {
      const invalidSettings = {
        targetScope: 'invalid',
        presets: { video: true, document: false, image: false },
        simpleFilters: [],
        regexFilters: [],
        resourceTypes: [],
        allowList: [],
        denyList: [],
        headerPolicy: { basic: true, sensitiveEnabled: false },
        hlsMpdMode: 'playlistOnly',
        limits: { maxEntries: 3000 },
        exportSettings: { filenameTemplate: 'test', newline: 'LF' },
        ui: { showBadge: true },
      };
      const result = schemas.settingsSchema.safeParse(invalidSettings);
      if (result.success) {
        throw new Error('Should have rejected invalid targetScope');
      }
    });

    // Test 3: LogEntry schema
    test('logEntrySchema should be defined', () => {
      expect(schemas.logEntrySchema).toBeTruthy();
    });

    test('logEntrySchema should validate valid log entry', () => {
      const validEntry = {
        id: 'abc-123',
        requestId: 'req-456',
        url: 'https://example.com/video.m3u8',
        method: 'GET',
        type: 'xmlhttprequest',
        tabId: 1,
        frameId: 0,
        timestamp: Date.now(),
        dedupeKey: 'hash-123',
      };
      const result = schemas.logEntrySchema.safeParse(validEntry);
      if (!result.success) {
        throw new Error(`Validation failed: ${JSON.stringify(result.error)}`);
      }
    });

    test('logEntrySchema should accept optional fields', () => {
      const entryWithOptionals = {
        id: 'abc-123',
        requestId: 'req-456',
        url: 'https://example.com/video.m3u8',
        method: 'GET',
        type: 'xmlhttprequest',
        tabId: 1,
        frameId: 0,
        timestamp: Date.now(),
        dedupeKey: 'hash-123',
        initiator: 'https://example.com',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: 'https://example.com',
        },
      };
      const result = schemas.logEntrySchema.safeParse(entryWithOptionals);
      if (!result.success) {
        throw new Error(`Validation failed: ${JSON.stringify(result.error)}`);
      }
    });

    // Test 4: LogData schema
    test('logDataSchema should be defined', () => {
      expect(schemas.logDataSchema).toBeTruthy();
    });

    test('logDataSchema should validate valid log data', () => {
      const validLogData = {
        isMonitoring: true,
        monitoringScope: 'allTabs',
        entries: [],
      };
      const result = schemas.logDataSchema.safeParse(validLogData);
      if (!result.success) {
        throw new Error(`Validation failed: ${JSON.stringify(result.error)}`);
      }
    });

    test('logDataSchema should accept optional activeTabId', () => {
      const logDataWithTabId = {
        isMonitoring: true,
        monitoringScope: 'activeTab',
        activeTabId: 123,
        entries: [],
      };
      const result = schemas.logDataSchema.safeParse(logDataWithTabId);
      if (!result.success) {
        throw new Error(`Validation failed: ${JSON.stringify(result.error)}`);
      }
    });

    // Test 5: Export format types
    test('exportFormatSchema should be defined', () => {
      expect(schemas.exportFormatSchema).toBeTruthy();
    });

    test('exportFormatSchema should validate export formats', () => {
      const formats = ['url-list', 'bash-curl', 'bash-curl-headers', 'bash-yt-dlp', 'powershell'];
      formats.forEach((format) => {
        const result = schemas.exportFormatSchema.safeParse(format);
        if (!result.success) {
          throw new Error(`Format ${format} should be valid`);
        }
      });
    });

    console.log('\n✓ All type definitions verification tests passed!');
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.log('\n⚠ Schema files not found yet - expected in RED phase');
      process.exit(1);
    } else {
      throw error;
    }
  }
}

runSchemaTests();

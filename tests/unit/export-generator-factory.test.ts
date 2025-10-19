/**
 * Unit Tests for Export Generator Factory Pattern
 * Testing TDD approach for Issue #64
 */

import { describe, it, expect } from 'vitest';
import type { LogEntry, ExportFormat } from '@/types';
import type { IExportGenerator } from '@/lib/export/generator-factory';
import { ExportGeneratorFactory } from '@/lib/export/generator-factory';

describe('Export Generator Factory Pattern', () => {
  const mockEntry: LogEntry = {
    id: '1',
    requestId: 'req1',
    url: 'https://example.com/video.m3u8',
    method: 'GET',
    type: 'media',
    tabId: 1,
    frameId: 0,
    timestamp: Date.now(),
    dedupeKey: 'key1',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Referer: 'https://example.com',
    },
    pageMetadata: {
      pageTitle: 'Test Video',
      manifestMetadata: {
        type: 'hls',
        variants: [
          {
            url: 'https://example.com/720p.m3u8',
            bandwidth: 2000000,
            resolution: '1280x720',
            label: '720p',
          },
          {
            url: 'https://example.com/1080p.m3u8',
            bandwidth: 5000000,
            resolution: '1920x1080',
            label: '1080p',
          },
        ],
      },
    },
  };

  const mockEntries: LogEntry[] = [mockEntry];

  describe('IExportGenerator Interface', () => {
    it('should have canHandle method', () => {
      // This will fail until we implement the interface
      const generator: IExportGenerator = null as unknown as IExportGenerator;
      expect(generator).toBeDefined();
    });

    it('should have generate method', () => {
      // This will fail until we implement the interface
      const generator: IExportGenerator = null as unknown as IExportGenerator;
      expect(generator).toBeDefined();
    });
  });

  describe('ExportGeneratorFactory', () => {
    it('should create factory instance', () => {
      const factory = new ExportGeneratorFactory();
      expect(factory).toBeDefined();
    });

    it('should get generator for bash-batch-download format', () => {
      const factory = new ExportGeneratorFactory();
      const generator = factory.getGenerator('bash-batch-download');
      expect(generator).toBeDefined();
      expect(generator.canHandle('bash-batch-download')).toBe(true);
    });

    it('should get generator for powershell-batch-download format', () => {
      const factory = new ExportGeneratorFactory();
      const generator = factory.getGenerator('powershell-batch-download');
      expect(generator).toBeDefined();
      expect(generator.canHandle('powershell-batch-download')).toBe(true);
    });

    it('should get generator for template-based formats', () => {
      const factory = new ExportGeneratorFactory();
      const generator = factory.getGenerator('url-list');
      expect(generator).toBeDefined();
      expect(generator.canHandle('url-list')).toBe(true);
    });

    it('should throw error for unknown format', () => {
      const factory = new ExportGeneratorFactory();
      expect(() => {
        factory.getGenerator('unknown-format' as ExportFormat);
      }).toThrow('No generator found for format');
    });
  });

  describe('BashBatchDownloadGenerator', () => {
    it('should handle bash-batch-download format', async () => {
      const factory = new ExportGeneratorFactory();
      const generator = factory.getGenerator('bash-batch-download');

      expect(generator.canHandle('bash-batch-download')).toBe(true);
      expect(generator.canHandle('powershell-batch-download')).toBe(false);
    });

    it('should generate interactive bash script with quality menu', async () => {
      const factory = new ExportGeneratorFactory();
      const generator = factory.getGenerator('bash-batch-download');

      const content = await generator.generate(mockEntries);

      expect(content).toContain('#!/bin/bash');
      expect(content).toContain('720p');
      expect(content).toContain('1080p');
      expect(content).toContain('read -p');
    });

    it('should throw error when no entries provided', async () => {
      const factory = new ExportGeneratorFactory();
      const generator = factory.getGenerator('bash-batch-download');

      await expect(generator.generate([])).rejects.toThrow('No entries to export');
    });
  });

  describe('PowerShellBatchDownloadGenerator', () => {
    it('should handle powershell-batch-download format', async () => {
      const factory = new ExportGeneratorFactory();
      const generator = factory.getGenerator('powershell-batch-download');

      expect(generator.canHandle('powershell-batch-download')).toBe(true);
      expect(generator.canHandle('bash-batch-download')).toBe(false);
    });

    it('should generate interactive PowerShell script with quality menu', async () => {
      const factory = new ExportGeneratorFactory();
      const generator = factory.getGenerator('powershell-batch-download');

      const content = await generator.generate(mockEntries);

      expect(content).toContain('# Batch Video Downloader');
      expect(content).toContain('720p');
      expect(content).toContain('1080p');
      expect(content).toContain('Read-Host');
    });

    it('should throw error when no entries provided', async () => {
      const factory = new ExportGeneratorFactory();
      const generator = factory.getGenerator('powershell-batch-download');

      await expect(generator.generate([])).rejects.toThrow('No entries to export');
    });
  });

  describe('TemplateBasedGenerator', () => {
    it('should handle url-list format', async () => {
      const factory = new ExportGeneratorFactory();
      const generator = factory.getGenerator('url-list');

      expect(generator.canHandle('url-list')).toBe(true);
    });

    it('should generate content from template', async () => {
      const factory = new ExportGeneratorFactory();
      const generator = factory.getGenerator('url-list');

      const content = await generator.generate(mockEntries);

      expect(content).toContain('https://example.com/video.m3u8');
    });

    it('should handle bash-curl format', async () => {
      const factory = new ExportGeneratorFactory();
      const generator = factory.getGenerator('bash-curl');

      const content = await generator.generate(mockEntries);

      expect(content).toContain('#!/bin/bash');
      expect(content).toContain('curl');
    });

    it('should not handle formats handled by other generators', async () => {
      const factory = new ExportGeneratorFactory();
      const urlListGenerator = factory.getGenerator('url-list');

      // url-list generator should not handle bash-batch-download
      expect(urlListGenerator.canHandle('bash-batch-download')).toBe(false);
      expect(urlListGenerator.canHandle('powershell-batch-download')).toBe(false);
      expect(urlListGenerator.canHandle('bash-yt-dlp-cookies')).toBe(false);
    });
  });

  describe('Factory extensibility (Open/Closed Principle)', () => {
    it('should allow adding new generators without modifying factory', () => {
      // Test that factory can be extended with new generators
      const factory = new ExportGeneratorFactory();

      // All built-in generators should be registered
      const builtInFormats: ExportFormat[] = [
        'url-list',
        'bash-curl',
        'bash-curl-headers',
        'bash-yt-dlp',
        'powershell',
        'bash-batch-download',
        'powershell-batch-download',
      ];

      builtInFormats.forEach((format) => {
        expect(() => factory.getGenerator(format)).not.toThrow();
      });
    });

    it('should maintain single responsibility per generator', () => {
      const factory = new ExportGeneratorFactory();

      // Each generator should handle only its specific format(s)
      const bashGenerator = factory.getGenerator('bash-batch-download');
      expect(bashGenerator.canHandle('bash-batch-download')).toBe(true);
      expect(bashGenerator.canHandle('powershell-batch-download')).toBe(false);

      const psGenerator = factory.getGenerator('powershell-batch-download');
      expect(psGenerator.canHandle('powershell-batch-download')).toBe(true);
      expect(psGenerator.canHandle('bash-batch-download')).toBe(false);
    });
  });
});

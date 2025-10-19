/**
 * Export Generator Factory Pattern
 * Implements Factory Pattern for export format generation
 *
 * Benefits:
 * - Open/Closed Principle: Easy to add new formats without modifying existing code
 * - Single Responsibility: Each generator handles one specific format
 * - Better testability: Each generator can be tested independently
 */

import type { LogEntry, ExportFormat } from '@/types';
import { ExportError } from '@/lib/errors';
import { renderTemplate } from '@/lib/mustache-template';
import { getBuiltInTemplate } from '@/lib/builtinTemplates';
import {
  generateBashBatchDownload,
  generatePowerShellBatchDownload,
} from '@/lib/batch-download-generator';
import { generateBashYtDlpWithCookies } from './generators/bash-generator';

/**
 * Export Generator Interface
 * All export generators must implement this interface
 */
export interface IExportGenerator {
  /**
   * Check if this generator can handle the given format
   * @param format - Export format to check
   * @returns true if this generator can handle the format
   */
  canHandle(format: ExportFormat): boolean;

  /**
   * Generate export content for the given entries
   * @param entries - Log entries to export
   * @returns Generated content string
   * @throws {ExportError} If generation fails
   */
  generate(entries: LogEntry[]): Promise<string>;
}

/**
 * Bash Batch Download Generator
 * Handles interactive bash scripts with quality selection menus
 */
export class BashBatchDownloadGenerator implements IExportGenerator {
  canHandle(format: ExportFormat): boolean {
    return format === 'bash-batch-download';
  }

  async generate(entries: LogEntry[]): Promise<string> {
    if (entries.length === 0) {
      throw new ExportError('No entries to export', { format: 'bash-batch-download' });
    }
    const firstEntry = entries[0];
    if (!firstEntry) {
      throw new ExportError('No entries to export', { format: 'bash-batch-download' });
    }
    return generateBashBatchDownload(firstEntry);
  }
}

/**
 * PowerShell Batch Download Generator
 * Handles interactive PowerShell scripts with quality selection menus
 */
export class PowerShellBatchDownloadGenerator implements IExportGenerator {
  canHandle(format: ExportFormat): boolean {
    return format === 'powershell-batch-download';
  }

  async generate(entries: LogEntry[]): Promise<string> {
    if (entries.length === 0) {
      throw new ExportError('No entries to export', { format: 'powershell-batch-download' });
    }
    const firstEntry = entries[0];
    if (!firstEntry) {
      throw new ExportError('No entries to export', { format: 'powershell-batch-download' });
    }
    return generatePowerShellBatchDownload(firstEntry);
  }
}

/**
 * Bash yt-dlp with Cookies Generator
 * Handles bash scripts with cookie extraction for yt-dlp
 */
export class BashYtDlpCookiesGenerator implements IExportGenerator {
  canHandle(format: ExportFormat): boolean {
    return format === 'bash-yt-dlp-cookies';
  }

  async generate(entries: LogEntry[]): Promise<string> {
    return await generateBashYtDlpWithCookies(entries);
  }
}

/**
 * Template-based Generator
 * Handles formats that use Handlebars templates
 * Each instance is specific to one format
 */
export class TemplateBasedGenerator implements IExportGenerator {
  private format: ExportFormat;

  constructor(format: ExportFormat) {
    this.format = format;
  }

  canHandle(format: ExportFormat): boolean {
    // Each instance handles only its specific format
    return format === this.format && getBuiltInTemplate(format) !== null;
  }

  async generate(entries: LogEntry[]): Promise<string> {
    const template = getBuiltInTemplate(this.format);
    if (!template) {
      throw new ExportError(`Template not found for format: ${this.format}`, {
        format: this.format,
      });
    }
    return renderTemplate(template.template, entries);
  }
}

/**
 * Export Generator Factory
 * Creates appropriate generator based on export format
 */
export class ExportGeneratorFactory {
  private generators: IExportGenerator[];

  constructor() {
    // Register all available generators
    // Order matters: specific generators before generic ones
    this.generators = [
      new BashBatchDownloadGenerator(),
      new PowerShellBatchDownloadGenerator(),
      new BashYtDlpCookiesGenerator(),
      // Template-based generators for each format
      new TemplateBasedGenerator('url-list'),
      new TemplateBasedGenerator('bash-curl'),
      new TemplateBasedGenerator('bash-curl-headers'),
      new TemplateBasedGenerator('bash-yt-dlp'),
      new TemplateBasedGenerator('powershell'),
    ];
  }

  /**
   * Get appropriate generator for the given format
   * @param format - Export format
   * @returns Generator instance
   * @throws {ExportError} If no generator found for format
   */
  getGenerator(format: ExportFormat): IExportGenerator {
    const generator = this.generators.find((g) => g.canHandle(format));

    if (!generator) {
      throw new ExportError(`No generator found for format: ${format}`, { format });
    }

    return generator;
  }

  /**
   * Add a custom generator to the factory
   * @param generator - Custom generator to add
   */
  addGenerator(generator: IExportGenerator): void {
    // Add at the beginning to allow overriding built-in generators
    this.generators.unshift(generator);
  }
}

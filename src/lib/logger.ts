/**
 * Unified Logger
 * Centralized logging for better control and debugging
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Logger configuration
 */
const config = {
  enabled: import.meta.env.DEV,
  minLevel: 'error' as LogLevel,
};

/**
 * Log levels priority
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * Unified logger class
 */
export class Logger {
  /**
   * Log error message
   */
  static error(context: string, error: unknown, meta?: object): void {
    if (!config.enabled || LOG_LEVELS.error < LOG_LEVELS[config.minLevel]) {
      return;
    }
    console.error(`[${context}]`, error, meta);
  }

  /**
   * Log warning message
   */
  static warn(context: string, message: string, meta?: object): void {
    if (!config.enabled || LOG_LEVELS.warn < LOG_LEVELS[config.minLevel]) {
      return;
    }
    console.warn(`[${context}]`, message, meta);
  }

  /**
   * Log info message
   */
  static info(context: string, message: string, meta?: object): void {
    if (!config.enabled || LOG_LEVELS.info < LOG_LEVELS[config.minLevel]) {
      return;
    }
    console.info(`[${context}]`, message, meta);
  }

  /**
   * Log debug message
   */
  static debug(context: string, message: string, meta?: object): void {
    if (!config.enabled || LOG_LEVELS.debug < LOG_LEVELS[config.minLevel]) {
      return;
    }
    console.debug(`[${context}]`, message, meta);
  }

  /**
   * Configure logger
   */
  static configure(options: { enabled?: boolean; minLevel?: LogLevel }): void {
    if (options.enabled !== undefined) {
      config.enabled = options.enabled;
    }
    if (options.minLevel !== undefined) {
      config.minLevel = options.minLevel;
    }
  }
}

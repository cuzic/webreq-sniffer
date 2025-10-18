/**
 * Template Expression Evaluator
 * Safely evaluates JavaScript expressions in filename templates
 */

import { sanitizeFilename } from './filename';

export interface TemplateContext {
  // Page metadata
  pageTitle?: string;
  ogTitle?: string;
  videoTitle?: string;
  metaTitle?: string;
  metaDescription?: string;

  // Manifest metadata
  manifestTitle?: string;
  manifestType?: string;
  segmentPattern?: string;
  programDate?: string;

  // System variables
  date: string;
  time: string;
  timestamp: number;
  domain: string;
  ext: string;
}

/**
 * Helper functions available in template expressions
 */
const helpers = {
  /**
   * Sanitize string for filename
   */
  sanitize: (str: string): string => {
    return sanitizeFilename(str);
  },

  /**
   * Truncate string to specified length
   */
  truncate: (str: string, len: number, suffix = ''): string => {
    if (str.length <= len) return str;
    return str.substring(0, len) + suffix;
  },

  /**
   * Convert string to slug format
   */
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  },

  /**
   * Remove parentheses and brackets
   */
  removeParens: (str: string): string => {
    return str.replace(/[【\[\(].*?[】\]\)]/g, '').trim();
  },

  /**
   * Capitalize first letter
   */
  capitalize: (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Remove specific pattern from string
   */
  remove: (str: string, pattern: string | RegExp): string => {
    return str.replace(pattern, '');
  },

  /**
   * Convert to lowercase
   */
  lowercase: (str: string): string => {
    return str.toLowerCase();
  },

  /**
   * Convert to uppercase
   */
  uppercase: (str: string): string => {
    return str.toUpperCase();
  },
};

/**
 * Create safe context for expression evaluation
 */
function createSafeContext(context: TemplateContext): Record<string, unknown> {
  return {
    // User variables (explicitly set to undefined if not provided)
    pageTitle: context.pageTitle ?? undefined,
    ogTitle: context.ogTitle ?? undefined,
    videoTitle: context.videoTitle ?? undefined,
    metaTitle: context.metaTitle ?? undefined,
    metaDescription: context.metaDescription ?? undefined,
    manifestTitle: context.manifestTitle ?? undefined,
    manifestType: context.manifestType ?? undefined,
    segmentPattern: context.segmentPattern ?? undefined,
    programDate: context.programDate ?? undefined,
    date: context.date,
    time: context.time,
    timestamp: context.timestamp,
    domain: context.domain,
    ext: context.ext,

    // Safe globals (limited set)
    String,
    Number,
    Boolean,
    Array: Array,
    Object: Object,
    Math: Math,
    Date: Date,
    RegExp,

    // Helper functions
    ...helpers,

    // Prevent access to dangerous globals (explicitly undefined)
    window: undefined,
    document: undefined,
    chrome: undefined,
    eval: undefined,
    Function: undefined,
    setTimeout: undefined,
    setInterval: undefined,
    fetch: undefined,
    XMLHttpRequest: undefined,
  };
}

/**
 * Evaluate JavaScript expression with timeout
 */
function evaluateWithTimeout<T>(fn: () => T, timeout: number): T {
  const startTime = Date.now();
  const result = fn();

  // Simple timeout check (not perfect but better than nothing)
  if (Date.now() - startTime > timeout) {
    throw new Error('Expression evaluation timeout');
  }

  return result;
}

/**
 * Evaluate JavaScript expression in restricted context
 *
 * @param expression - JavaScript expression to evaluate
 * @param context - Template context with available variables
 * @returns Evaluated result as string
 * @throws Error if evaluation fails
 */
export function evaluateExpression(expression: string, context: TemplateContext): string {
  // Validate expression length
  if (expression.length > 1000) {
    throw new Error('Expression too long (max 1000 characters)');
  }

  // Create safe context
  const safeContext = createSafeContext(context);

  try {
    // Build destructuring assignment from context
    const contextKeys = Object.keys(safeContext);
    const destructure = contextKeys.join(', ');

    // Create function that destructures the context
    // This avoids parameter name restrictions with 'arguments'
    const code = `
      const { ${destructure} } = ctx;
      return (${expression});
    `;

    const fn = new Function('ctx', code);

    // Execute with timeout (100ms)
    const result = evaluateWithTimeout(() => fn(safeContext), 100);

    // Convert result to string (including undefined -> 'undefined')
    return String(result);
  } catch (error) {
    throw new Error(
      `Template evaluation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Safe evaluation with fallback value
 *
 * @param expression - JavaScript expression to evaluate
 * @param context - Template context
 * @param fallback - Fallback value if evaluation fails
 * @returns Evaluated result or fallback
 */
export function safeEvaluate(
  expression: string,
  context: TemplateContext,
  fallback: string = ''
): string {
  try {
    return evaluateExpression(expression, context);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Template evaluation error for "${expression}":`, error);
    }
    return fallback;
  }
}

/**
 * Check if expression contains JavaScript operators/syntax
 */
export function isJavaScriptExpression(expression: string): boolean {
  // Check for common JavaScript operators and syntax
  return (
    expression.includes('?.') || // Optional chaining
    expression.includes('??') || // Nullish coalescing
    expression.includes('?') || // Ternary operator
    expression.includes('(') || // Function calls
    expression.includes('===') ||
    expression.includes('!==') ||
    expression.includes('&&') ||
    expression.includes('||') ||
    expression.includes('.replace') ||
    expression.includes('.toLowerCase') ||
    expression.includes('.toUpperCase') ||
    expression.includes('.substring') ||
    expression.includes('.trim')
  );
}

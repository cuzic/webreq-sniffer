/**
 * Pipeline Template Engine
 * Evaluates templates with variables and filters
 */

import { parseTemplate, type TemplateVariable } from './pipeline-template-parser';
import { applyFilter } from './pipeline-template-filters';
import { Logger } from './logger';

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

  // Allow additional custom variables
  [key: string]: string | number | undefined;
}

/**
 * Evaluate template with context
 *
 * @param template - Template string like "{videoTitle | lowercase}_{date}.{ext}"
 * @param context - Context object with variable values
 * @returns Evaluated string
 */
export function evaluateTemplate(template: string, context: TemplateContext): string {
  // Parse template
  const tokens = parseTemplate(template);

  // Evaluate each token
  const parts: string[] = [];

  for (const token of tokens) {
    if (token.type === 'literal') {
      parts.push(token.value);
    } else if (token.type === 'variable') {
      const value = evaluateVariable(token, context);
      parts.push(value);
    }
  }

  return parts.join('');
}

/**
 * Evaluate a variable token with filters
 */
function evaluateVariable(variable: TemplateVariable, context: TemplateContext): string {
  // Get initial value from context
  let value = getVariableValue(variable.name, context);

  // Apply filters in sequence
  for (const filter of variable.filters) {
    value = applyFilter(filter.name, value, filter.args);
  }

  return value;
}

/**
 * Get variable value from context
 */
function getVariableValue(name: string, context: TemplateContext): string {
  const value = context[name];

  // Return empty string for undefined/null values
  // Use the 'default' filter to provide fallback values if needed
  if (value === undefined || value === null) {
    return '';
  }

  return String(value);
}

/**
 * Safe evaluation with error handling
 *
 * @param template - Template string
 * @param context - Context object
 * @param fallback - Fallback value on error
 * @returns Evaluated string or fallback
 */
export function safeEvaluateTemplate(
  template: string,
  context: TemplateContext,
  fallback: string = ''
): string {
  try {
    return evaluateTemplate(template, context);
  } catch (error) {
    if (import.meta.env.DEV) {
      Logger.error('pipeline-template', error, { template, context: 'evaluation' });
    }
    return fallback;
  }
}

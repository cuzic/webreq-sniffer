/**
 * Pipeline Template Parser
 * Safely parses template strings with pipe-based filters
 *
 * Example: {videoTitle | lowercase | replace(" ", "_")}_{date}.{ext}
 */

export interface TemplateVariable {
  type: 'variable';
  name: string;
  filters: Filter[];
  raw: string; // Original {variable | filter} string
}

export interface Filter {
  name: string;
  args: FilterArg[];
}

export type FilterArg = string | number;

export interface TemplateLiteral {
  type: 'literal';
  value: string;
}

export type TemplateToken = TemplateVariable | TemplateLiteral;

/**
 * Parse template string into tokens
 *
 * @param template - Template string like "{videoTitle | lowercase}_{date}.{ext}"
 * @returns Array of tokens (variables and literals)
 */
export function parseTemplate(template: string): TemplateToken[] {
  if (template.length > 1000) {
    throw new Error('Template too long (max 1000 characters)');
  }

  const tokens: TemplateToken[] = [];

  // Regular expression to match {variable | filter1 | filter2(...)}
  const variablePattern = /\{([^}]+)\}/g;

  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = variablePattern.exec(template)) !== null) {
    const matchStart = match.index;
    const matchEnd = variablePattern.lastIndex;

    // Add literal before this variable
    if (matchStart > lastIndex) {
      const literal = template.substring(lastIndex, matchStart);
      tokens.push({
        type: 'literal',
        value: literal,
      });
    }

    // Parse the variable and its filters
    const content = match[1]!.trim();
    const variable = parseVariableWithFilters(content, match[0]!);
    tokens.push(variable);

    lastIndex = matchEnd;
  }

  // Add remaining literal
  if (lastIndex < template.length) {
    const literal = template.substring(lastIndex);
    tokens.push({
      type: 'literal',
      value: literal,
    });
  }

  return tokens;
}

/**
 * Parse variable with filters: "videoTitle | lowercase | replace(' ', '_')"
 */
function parseVariableWithFilters(content: string, raw: string): TemplateVariable {
  const parts = content.split('|').map((p) => p.trim());

  if (parts.length === 0) {
    throw new Error(`Invalid variable syntax: ${raw}`);
  }

  const variableName = parts[0]!;

  // Validate variable name (alphanumeric and underscore only)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variableName)) {
    throw new Error(`Invalid variable name: ${variableName}`);
  }

  const filters: Filter[] = [];

  // Parse filters (if any)
  for (let i = 1; i < parts.length; i++) {
    const filterStr = parts[i]!;
    const filter = parseFilter(filterStr);
    filters.push(filter);
  }

  return {
    type: 'variable',
    name: variableName,
    filters,
    raw,
  };
}

/**
 * Parse a single filter: "replace(' ', '_')" or "truncate(50)" or "lowercase"
 */
function parseFilter(filterStr: string): Filter {
  // Match: filterName(arg1, arg2, ...)
  const match = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\(([^)]*)\))?$/.exec(filterStr);

  if (!match) {
    throw new Error(`Invalid filter syntax: ${filterStr}`);
  }

  const filterName = match[1]!;
  const argsStr = match[2];

  const args: FilterArg[] = [];

  if (argsStr) {
    // Parse arguments
    const parsedArgs = parseFilterArgs(argsStr);
    args.push(...parsedArgs);
  }

  return {
    name: filterName,
    args,
  };
}

/**
 * Parse filter arguments: "50, 'hello'" or '"world", 100'
 */
function parseFilterArgs(argsStr: string): FilterArg[] {
  const args: FilterArg[] = [];

  // Simple argument parser (handles strings and numbers)
  // This is intentionally simple to avoid eval-like behavior

  let currentArg = '';
  let inString = false;
  let stringChar: '"' | "'" | null = null;
  let escaped = false;
  let isStringLiteral = false; // Track if current argument is a string literal

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i]!;

    if (escaped) {
      currentArg += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      isStringLiteral = true; // Mark as string literal
      continue;
    }

    if (inString && char === stringChar) {
      inString = false;
      stringChar = null;
      continue;
    }

    if (!inString && char === ',') {
      // End of argument
      const processedArg = isStringLiteral ? currentArg : currentArg.trim();
      if (processedArg !== '' || isStringLiteral) {
        // Keep empty strings if they were string literals
        args.push(parseArgValue(processedArg, isStringLiteral));
      }
      currentArg = '';
      isStringLiteral = false;
      continue;
    }

    // Skip leading whitespace for non-string-literal arguments
    if (!inString && char === ' ' && currentArg === '' && !isStringLiteral) {
      continue;
    }

    currentArg += char;
  }

  // Last argument
  const processedArg = isStringLiteral ? currentArg : currentArg.trim();
  if (processedArg !== '' || isStringLiteral) {
    args.push(parseArgValue(processedArg, isStringLiteral));
  }

  return args;
}

/**
 * Parse a single argument value (number or string)
 */
function parseArgValue(value: string, isStringLiteral: boolean): FilterArg {
  // If it's a string literal, return as string
  if (isStringLiteral) {
    return value;
  }

  // Try to parse as number
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') {
    return num;
  }

  // Otherwise it's a string
  return value;
}

/**
 * Validate template for security
 */
export function validateTemplate(template: string): { valid: boolean; error?: string } {
  try {
    parseTemplate(template);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

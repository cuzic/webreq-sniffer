import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validate a regex pattern
 */
export function validateRegex(pattern: string): { valid: boolean; error?: string } {
  try {
    new RegExp(pattern, 'i');
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid regex',
    };
  }
}

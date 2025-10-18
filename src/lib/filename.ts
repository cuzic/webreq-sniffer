/**
 * Filename Utilities
 * Functions for sanitizing and generating safe filenames
 */

/**
 * Sanitize a filename to be safe for filesystems
 * Replaces invalid characters and enforces length limits
 *
 * @param filename The filename to sanitize
 * @returns A safe filename
 */
export function sanitizeFilename(filename: string): string {
  // Trim whitespace first
  let sanitized = filename.trim();

  // Remove leading dots (hidden files on Unix) - do this early
  sanitized = sanitized.replace(/^\.+/, '');

  // Replace Windows reserved characters and other problematic characters
  // < > : " / \ | ? * ( ) [ ] # and other special chars
  sanitized = sanitized.replace(/[<>:"/\\|?*()[\]#]/g, '_');

  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Replace spaces with underscores
  sanitized = sanitized.replace(/\s/g, '_');

  // Replace multiple consecutive underscores with single underscore
  sanitized = sanitized.replace(/_{2,}/g, '_');

  // Extract extension (only alphanumeric after last dot)
  const extMatch = sanitized.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[0] : '';

  // Get name part (everything before the extension)
  let name = ext ? sanitized.slice(0, sanitized.lastIndexOf(ext)) : sanitized;

  // Remove leading/trailing underscores from name part
  name = name.replace(/^_+|_+$/g, '');

  // Recombine
  sanitized = name + ext;

  // Fallback if empty, just extension, or just dots/underscores
  if (!sanitized || sanitized === ext || /^[._]+$/.test(sanitized)) {
    sanitized = 'unnamed';
  }

  // Enforce 255 character limit (common filesystem limit)
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    // Try to preserve file extension
    const finalExtMatch = sanitized.match(/\.[^.]+$/);
    const finalExt = finalExtMatch ? finalExtMatch[0] : '';
    const nameWithoutExt = sanitized.slice(0, maxLength - finalExt.length);
    sanitized = nameWithoutExt + finalExt;
  }

  return sanitized;
}

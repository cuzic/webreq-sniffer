/**
 * UI Helper Functions
 * Utility functions for UI styling and formatting
 */

/**
 * Get background color class for resource type
 */
export function getTypeColor(type: string): string {
  switch (type) {
    case 'media':
      return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    case 'xmlhttprequest':
      return 'bg-green-50 border-green-200 hover:bg-green-100';
    case 'script':
      return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
    case 'stylesheet':
      return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
    case 'image':
      return 'bg-pink-50 border-pink-200 hover:bg-pink-100';
    case 'font':
      return 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100';
    case 'document':
      return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    default:
      return 'bg-slate-50 border-slate-200 hover:bg-slate-100';
  }
}

/**
 * Get badge color class for resource type
 */
export function getTypeBadgeColor(type: string): string {
  switch (type) {
    case 'media':
      return 'bg-blue-100 text-blue-800';
    case 'xmlhttprequest':
      return 'bg-green-100 text-green-800';
    case 'script':
      return 'bg-yellow-100 text-yellow-800';
    case 'stylesheet':
      return 'bg-purple-100 text-purple-800';
    case 'image':
      return 'bg-pink-100 text-pink-800';
    case 'font':
      return 'bg-indigo-100 text-indigo-800';
    case 'document':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

/**
 * Get emoji icon for resource type
 */
export function getTypeIcon(type: string): string {
  switch (type) {
    case 'media':
      return '🎬';
    case 'xmlhttprequest':
      return '📡';
    case 'script':
      return '📜';
    case 'stylesheet':
      return '🎨';
    case 'image':
      return '🖼️';
    case 'font':
      return '🔤';
    case 'document':
      return '📄';
    default:
      return '📦';
  }
}

/**
 * Get display name for resource type
 */
export function getTypeDisplayName(type: string): string {
  switch (type) {
    case 'xmlhttprequest':
      return 'XHR';
    case 'stylesheet':
      return 'CSS';
    case 'script':
      return 'JS';
    case 'media':
      return 'Media';
    case 'image':
      return 'Image';
    case 'font':
      return 'Font';
    case 'document':
      return 'Doc';
    default:
      return type;
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return '-';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Truncate URL for display
 */
export function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname + urlObj.search;

    if (path.length > maxLength - domain.length - 3) {
      const truncatedPath = path.slice(0, maxLength - domain.length - 6) + '...';
      return domain + truncatedPath;
    }

    return domain + path;
  } catch {
    // Invalid URL, just truncate
    return url.slice(0, maxLength - 3) + '...';
  }
}

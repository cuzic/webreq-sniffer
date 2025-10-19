/**
 * UI Helper Functions
 * Utility functions for UI styling and formatting
 */

/**
 * Resource type configuration
 */
type ResourceTypeConfig = {
  color: string;
  badgeColor: string;
  icon: string;
  displayName: string;
};

/**
 * Resource type configurations lookup table
 * Reduces cyclomatic complexity by replacing switch statements with object lookup
 */
const RESOURCE_TYPE_CONFIG: Record<string, ResourceTypeConfig> = {
  media: {
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    badgeColor: 'bg-blue-100 text-blue-800',
    icon: '🎬',
    displayName: 'Media',
  },
  xmlhttprequest: {
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    badgeColor: 'bg-green-100 text-green-800',
    icon: '📡',
    displayName: 'XHR',
  },
  script: {
    color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    icon: '📜',
    displayName: 'JS',
  },
  stylesheet: {
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    badgeColor: 'bg-purple-100 text-purple-800',
    icon: '🎨',
    displayName: 'CSS',
  },
  image: {
    color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    badgeColor: 'bg-pink-100 text-pink-800',
    icon: '🖼️',
    displayName: 'Image',
  },
  font: {
    color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    icon: '🔤',
    displayName: 'Font',
  },
  document: {
    color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
    badgeColor: 'bg-gray-100 text-gray-800',
    icon: '📄',
    displayName: 'Doc',
  },
};

/**
 * Default configuration for unknown resource types
 */
const DEFAULT_CONFIG: ResourceTypeConfig = {
  color: 'bg-slate-50 border-slate-200 hover:bg-slate-100',
  badgeColor: 'bg-slate-100 text-slate-800',
  icon: '📦',
  displayName: 'Unknown',
};

/**
 * Get configuration for resource type
 */
function getConfig(type: string): ResourceTypeConfig {
  return RESOURCE_TYPE_CONFIG[type] || DEFAULT_CONFIG;
}

/**
 * Get background color class for resource type
 * Cyclomatic complexity: 1 (was 8)
 */
export function getTypeColor(type: string): string {
  return getConfig(type).color;
}

/**
 * Get badge color class for resource type
 * Cyclomatic complexity: 1 (was 8)
 */
export function getTypeBadgeColor(type: string): string {
  return getConfig(type).badgeColor;
}

/**
 * Get emoji icon for resource type
 * Cyclomatic complexity: 1 (was 8)
 */
export function getTypeIcon(type: string): string {
  return getConfig(type).icon;
}

/**
 * Get display name for resource type
 * Cyclomatic complexity: 1 (was 8)
 */
export function getTypeDisplayName(type: string): string {
  const config = getConfig(type);
  return config.displayName === 'Unknown' ? type : config.displayName;
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

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
 * Uses semantic colors from the color system for WCAG AA compliance
 * Reduces cyclomatic complexity by replacing switch statements with object lookup
 */
const RESOURCE_TYPE_CONFIG: Record<string, ResourceTypeConfig> = {
  media: {
    color: 'bg-info/10 border-info/30 hover:bg-info/20',
    badgeColor: 'bg-info/20 text-info-foreground',
    icon: '🎬',
    displayName: 'Media',
  },
  xmlhttprequest: {
    color: 'bg-success/10 border-success/30 hover:bg-success/20',
    badgeColor: 'bg-success/20 text-success-foreground',
    icon: '📡',
    displayName: 'XHR',
  },
  script: {
    color: 'bg-warning/10 border-warning/30 hover:bg-warning/20',
    badgeColor: 'bg-warning/20 text-warning-foreground',
    icon: '📜',
    displayName: 'JS',
  },
  stylesheet: {
    color: 'bg-accent/10 border-accent/30 hover:bg-accent/20',
    badgeColor: 'bg-accent/20 text-accent-foreground',
    icon: '🎨',
    displayName: 'CSS',
  },
  image: {
    color: 'bg-secondary/10 border-secondary/30 hover:bg-secondary/20',
    badgeColor: 'bg-secondary/20 text-secondary-foreground',
    icon: '🖼️',
    displayName: 'Image',
  },
  font: {
    color: 'bg-primary/10 border-primary/30 hover:bg-primary/20',
    badgeColor: 'bg-primary/20 text-primary-foreground',
    icon: '🔤',
    displayName: 'Font',
  },
  document: {
    color: 'bg-muted/10 border-muted/30 hover:bg-muted/20',
    badgeColor: 'bg-muted/20 text-muted-foreground',
    icon: '📄',
    displayName: 'Doc',
  },
};

/**
 * Default configuration for unknown resource types
 * Uses muted colors for unknown types
 */
const DEFAULT_CONFIG: ResourceTypeConfig = {
  color: 'bg-muted/10 border-muted/30 hover:bg-muted/20',
  badgeColor: 'bg-muted/20 text-muted-foreground',
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

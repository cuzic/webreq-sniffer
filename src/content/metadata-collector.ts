/**
 * Page Metadata Collector
 * Extracts metadata from the current page for filename generation
 */

import type { PageMetadata, CustomSelector } from '@/types';

/**
 * Collect page metadata from the current document
 * @param customSelectors Optional array of custom CSS selectors for extracting video titles
 */
export function collectPageMetadata(customSelectors?: CustomSelector[]): PageMetadata {
  const metadata: PageMetadata = {
    pageTitle: document.title,
  };

  // Extract OG (Open Graph) tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    const content = ogTitle.getAttribute('content');
    if (content) {
      metadata.ogTitle = content;
    }
  }

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    const content = ogDescription.getAttribute('content');
    if (content) {
      metadata.ogDescription = content;
    }
  }

  // Extract standard meta tags
  const metaTitle = document.querySelector('meta[name="title"]');
  if (metaTitle) {
    const content = metaTitle.getAttribute('content');
    if (content) {
      metadata.metaTitle = content;
    }
  }

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    const content = metaDescription.getAttribute('content');
    if (content) {
      metadata.metaDescription = content;
    }
  }

  // Extract video player-specific title using custom selectors
  metadata.videoTitle = extractVideoTitle(customSelectors);

  return metadata;
}

/**
 * Check if current URL matches a pattern
 * Supports wildcards: *, youtube.com, *.example.com, etc.
 */
function matchesPattern(url: string, pattern: string): boolean {
  // Simple pattern matching - convert pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.') // Escape dots
    .replace(/\*/g, '.*'); // Convert * to .*

  const regex = new RegExp(regexPattern, 'i');
  return regex.test(url);
}

/**
 * Extract value from element using selector and optional attribute
 */
function extractValue(selector: string, attribute?: string): string | undefined {
  try {
    const element = document.querySelector(selector);
    if (!element) return undefined;

    if (attribute) {
      // Extract from attribute
      const value = element.getAttribute(attribute);
      return value?.trim();
    } else {
      // Extract from textContent
      return element.textContent?.trim();
    }
  } catch (error) {
    // Invalid selector or other error
    console.warn(`Failed to extract value with selector "${selector}":`, error);
    return undefined;
  }
}

/**
 * Extract video title using custom selectors or fallback to built-in logic
 * @param customSelectors Optional array of custom CSS selectors
 */
function extractVideoTitle(customSelectors?: CustomSelector[]): string | undefined {
  const currentUrl = window.location.href;

  // Try custom selectors first (if provided)
  if (customSelectors && customSelectors.length > 0) {
    for (const config of customSelectors) {
      // Skip disabled selectors
      if (!config.enabled) continue;

      // Check if current URL matches the pattern
      if (matchesPattern(currentUrl, config.pattern)) {
        const title = extractValue(config.selector, config.attribute);
        if (title) {
          return title;
        }
      }
    }
  }

  // Fallback: Generic video element title
  const videoElement = document.querySelector('video');
  if (videoElement) {
    const title = videoElement.getAttribute('title');
    if (title) {
      return title.trim();
    }
  }

  return undefined;
}

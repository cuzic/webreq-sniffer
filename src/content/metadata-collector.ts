/**
 * Page Metadata Collector
 * Extracts metadata from the current page for filename generation
 */

import type { PageMetadata, CustomSelector } from '@/types';
import { fetchAndParseManifest, detectManifestType } from '@/lib/manifest-parser';

/**
 * Collect page metadata from the current document
 * @param customSelectors Optional array of custom CSS selectors for extracting video titles
 */
export async function collectPageMetadata(
  customSelectors?: CustomSelector[]
): Promise<PageMetadata> {
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

  // Extract manifest metadata from video sources
  const manifestUrl = findManifestUrl();
  if (manifestUrl) {
    try {
      const manifestMetadata = await fetchAndParseManifest(manifestUrl);
      if (manifestMetadata) {
        metadata.manifestMetadata = manifestMetadata;
      }
    } catch (error) {
      console.warn('Failed to fetch/parse manifest:', error);
    }
  }

  return metadata;
}

/**
 * Find manifest URL (.m3u8 or .mpd) in the page
 * Checks video elements, source elements, and data attributes
 */
function findManifestUrl(): string | null {
  // Check video elements
  const videoElements = document.querySelectorAll('video');
  for (const video of videoElements) {
    const src = video.getAttribute('src');
    if (src && detectManifestType(src)) {
      return src;
    }

    // Check source children
    const sources = video.querySelectorAll('source');
    for (const source of sources) {
      const sourceSrc = source.getAttribute('src');
      if (sourceSrc && detectManifestType(sourceSrc)) {
        return sourceSrc;
      }
    }

    // Check data-* attributes (common in video players)
    const dataAttrs = ['data-src', 'data-url', 'data-stream', 'data-manifest'];
    for (const attr of dataAttrs) {
      const dataValue = video.getAttribute(attr);
      if (dataValue && detectManifestType(dataValue)) {
        return dataValue;
      }
    }
  }

  // Check all source elements globally
  const allSources = document.querySelectorAll('source');
  for (const source of allSources) {
    const src = source.getAttribute('src');
    if (src && detectManifestType(src)) {
      return src;
    }
  }

  return null;
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

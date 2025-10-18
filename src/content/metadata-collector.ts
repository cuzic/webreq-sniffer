/**
 * Page Metadata Collector
 * Extracts metadata from the current page for filename generation
 */

import type { PageMetadata } from '@/types';

/**
 * Collect page metadata from the current document
 */
export function collectPageMetadata(): PageMetadata {
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

  // Extract video player-specific title
  metadata.videoTitle = extractVideoTitle();

  return metadata;
}

/**
 * Extract video title from known video player implementations
 */
function extractVideoTitle(): string | undefined {
  const hostname = window.location.hostname;

  // YouTube
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    // Modern YouTube layout
    const ytTitle = document.querySelector(
      'h1.ytd-video-primary-info-renderer, h1.ytd-watch-metadata yt-formatted-string'
    );
    if (ytTitle) {
      return ytTitle.textContent?.trim();
    }

    // Fallback to meta tag
    const ytMeta = document.querySelector('meta[name="title"]');
    if (ytMeta) {
      return ytMeta.getAttribute('content')?.trim();
    }
  }

  // Vimeo
  if (hostname.includes('vimeo.com')) {
    const vimeoTitle = document.querySelector('h1.title, h1[class*="title"]');
    if (vimeoTitle) {
      return vimeoTitle.textContent?.trim();
    }
  }

  // Dailymotion
  if (hostname.includes('dailymotion.com')) {
    const dmTitle = document.querySelector('meta[property="og:title"]');
    if (dmTitle) {
      return dmTitle.getAttribute('content')?.trim();
    }
  }

  // Twitch
  if (hostname.includes('twitch.tv')) {
    const twitchTitle = document.querySelector('h1[data-a-target="stream-title"]');
    if (twitchTitle) {
      return twitchTitle.textContent?.trim();
    }
  }

  // Generic video element title
  const videoElement = document.querySelector('video');
  if (videoElement) {
    const title = videoElement.getAttribute('title');
    if (title) {
      return title.trim();
    }
  }

  return undefined;
}

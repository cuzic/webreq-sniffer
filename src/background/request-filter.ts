/**
 * RequestFilter Class
 * Encapsulates filtering logic for web requests
 */

import { shouldLogRequest } from './filtering';
import type { Settings } from '@/types';

/**
 * RequestFilter handles filtering logic for web requests
 * Determines whether a request should be logged based on settings
 */
export class RequestFilter {
  constructor(private settings: Settings) {}

  /**
   * Check if a request should be logged
   * @param url Request URL
   * @param resourceType Request resource type
   * @returns true if request should be logged
   */
  shouldLog(url: string, resourceType: string): boolean {
    return shouldLogRequest(url, resourceType, this.settings);
  }

  /**
   * Update filter settings
   * @param settings New settings
   */
  updateSettings(settings: Settings): void {
    this.settings = settings;
  }
}

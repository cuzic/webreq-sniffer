/**
 * Filter Preferences
 * Persistence layer for filter state (duplicate/manifest filters)
 */

import { DuplicateStrategy } from './duplicate-detector';
import { Logger } from './logger';

/**
 * Filter preferences that persist across sessions
 */
export interface FilterPreferences {
  showDuplicatesOnly: boolean;
  duplicateStrategy: DuplicateStrategy;
  smartFilterEnabled: boolean;
}

/**
 * Storage key for filter preferences
 */
const STORAGE_KEY = 'filterPreferences';

/**
 * Get default filter preferences
 */
export function getDefaultFilterPreferences(): FilterPreferences {
  return {
    showDuplicatesOnly: false,
    duplicateStrategy: DuplicateStrategy.KEEP_FIRST,
    smartFilterEnabled: false,
  };
}

/**
 * Validate duplicate strategy value
 */
function isValidDuplicateStrategy(value: any): value is DuplicateStrategy {
  return value === DuplicateStrategy.KEEP_FIRST || value === DuplicateStrategy.KEEP_LAST;
}

/**
 * Save filter preferences to chrome.storage.local
 * Merges with existing preferences (partial updates supported)
 */
export async function saveFilterPreferences(
  preferences: Partial<FilterPreferences>
): Promise<void> {
  try {
    // Load current preferences
    const current = await loadFilterPreferences();

    // Merge with new preferences
    const updated: FilterPreferences = {
      ...current,
      ...preferences,
    };

    // Save to storage using callback-based API
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
          resolve();
        });
      } catch (error) {
        Logger.error('filter-preferences', error, { context: 'save' });
        resolve(); // Resolve anyway to prevent rejection
      }
    });
  } catch (error) {
    Logger.error('filter-preferences', error, { context: 'save' });
  }
}

/**
 * Load filter preferences from chrome.storage.local
 * Returns defaults if no preferences are stored
 */
export async function loadFilterPreferences(): Promise<FilterPreferences> {
  try {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          const stored = result[STORAGE_KEY];

          if (!stored) {
            resolve(getDefaultFilterPreferences());
            return;
          }

          // Merge with defaults to handle missing fields
          const defaults = getDefaultFilterPreferences();
          const preferences: FilterPreferences = {
            showDuplicatesOnly: stored.showDuplicatesOnly ?? defaults.showDuplicatesOnly,
            duplicateStrategy: isValidDuplicateStrategy(stored.duplicateStrategy)
              ? stored.duplicateStrategy
              : defaults.duplicateStrategy,
            smartFilterEnabled: stored.smartFilterEnabled ?? defaults.smartFilterEnabled,
          };

          resolve(preferences);
        });
      } catch (error) {
        Logger.error('filter-preferences', error, { context: 'load' });
        resolve(getDefaultFilterPreferences());
      }
    });
  } catch (error) {
    Logger.error('filter-preferences', error, { context: 'load' });
    return getDefaultFilterPreferences();
  }
}

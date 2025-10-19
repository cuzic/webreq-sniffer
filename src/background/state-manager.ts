/**
 * State Manager
 * Provides caching layer for storage operations to reduce storage access
 */

import type { IStorageAdapter } from '@/lib/adapters/storage-adapter';
import type { Settings, LogData } from '@/types';
import { defaultSettings, defaultLogData } from '@/types';
import { STORAGE } from '@/lib/constants';

/**
 * State Manager with caching
 * Reduces storage access by caching frequently accessed data
 */
export class StateManager {
  private settingsCache: Settings | null = null;
  private logDataCache: LogData | null = null;
  private settingsCacheTimestamp: number = 0;
  private logDataCacheTimestamp: number = 0;

  constructor(
    private localAdapter: IStorageAdapter,
    private syncAdapter: IStorageAdapter,
    private cacheTTL: number = STORAGE.CACHE_TTL
  ) {}

  /**
   * Get settings with caching
   * @param forceRefresh Force refresh from storage, ignoring cache
   */
  async getSettings(forceRefresh = false): Promise<Settings> {
    if (!forceRefresh && this.settingsCache && this.isSettingsCacheValid()) {
      // Return a deep clone to prevent external mutations
      // Use structuredClone for better performance (Chrome 98+)
      return structuredClone(this.settingsCache);
    }

    // Fetch from storage
    const settings = await this.syncAdapter.get<Settings>('settings');
    this.settingsCache = settings || defaultSettings;
    this.settingsCacheTimestamp = Date.now();

    return structuredClone(this.settingsCache);
  }

  /**
   * Update settings and refresh cache
   * @param updates Partial settings to update
   */
  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    const updated = await this.syncAdapter.update<Settings>('settings', updates);

    // Update cache
    this.settingsCache = updated;
    this.settingsCacheTimestamp = Date.now();

    return updated;
  }

  /**
   * Get log data with caching
   * @param forceRefresh Force refresh from storage, ignoring cache
   */
  async getLogData(forceRefresh = false): Promise<LogData> {
    if (!forceRefresh && this.logDataCache && this.isLogDataCacheValid()) {
      // Return a deep clone to prevent external mutations
      // Use structuredClone for better performance (Chrome 98+)
      return structuredClone(this.logDataCache);
    }

    // Fetch from storage
    const logData = await this.localAdapter.get<LogData>('logData');
    this.logDataCache = logData || defaultLogData;
    this.logDataCacheTimestamp = Date.now();

    return structuredClone(this.logDataCache);
  }

  /**
   * Update log data and refresh cache
   * @param updates Partial log data to update
   */
  async updateLogData(updates: Partial<LogData>): Promise<LogData> {
    const updated = await this.localAdapter.update<LogData>('logData', updates);

    // Update cache
    this.logDataCache = updated;
    this.logDataCacheTimestamp = Date.now();

    return updated;
  }

  /**
   * Set log data directly and update cache
   * @param logData Complete log data
   */
  async setLogData(logData: LogData): Promise<void> {
    await this.localAdapter.set('logData', logData);

    // Update cache
    this.logDataCache = logData;
    this.logDataCacheTimestamp = Date.now();
  }

  /**
   * Set settings directly and update cache
   * @param settings Complete settings
   */
  async setSettings(settings: Settings): Promise<void> {
    await this.syncAdapter.set('settings', settings);

    // Update cache
    this.settingsCache = settings;
    this.settingsCacheTimestamp = Date.now();
  }

  /**
   * Invalidate all caches
   * Forces next get to fetch from storage
   */
  invalidateCache(): void {
    this.settingsCache = null;
    this.logDataCache = null;
    this.settingsCacheTimestamp = 0;
    this.logDataCacheTimestamp = 0;
  }

  /**
   * Check if settings cache is still valid
   */
  private isSettingsCacheValid(): boolean {
    return Date.now() - this.settingsCacheTimestamp < this.cacheTTL;
  }

  /**
   * Check if log data cache is still valid
   */
  private isLogDataCacheValid(): boolean {
    return Date.now() - this.logDataCacheTimestamp < this.cacheTTL;
  }
}

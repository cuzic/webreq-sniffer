/**
 * Storage Adapter Interface and Implementations
 * Provides abstraction layer for storage operations to enable dependency injection
 */

/**
 * Generic storage adapter interface
 * Allows for different storage backends (Chrome storage, localStorage, mock, etc.)
 */
export interface IStorageAdapter {
  /**
   * Get a value from storage
   * @param key Storage key
   * @returns Value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in storage
   * @param key Storage key
   * @param value Value to store
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Update a value partially (merge with existing)
   * @param key Storage key
   * @param updates Partial updates to merge
   * @returns Updated value
   */
  update<T>(key: string, updates: Partial<T>): Promise<T>;

  /**
   * Remove a key from storage
   * @param key Storage key
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all data from storage
   */
  clear(): Promise<void>;
}

/**
 * Mock storage adapter for testing
 * Stores data in memory
 */
export class MockStorageAdapter implements IStorageAdapter {
  private data = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    const value = this.data.get(key);
    return value !== undefined ? (value as T) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }

  async update<T>(key: string, updates: Partial<T>): Promise<T> {
    const existing = await this.get<T>(key);
    const updated = { ...(existing || ({} as T)), ...updates };
    await this.set(key, updated);
    return updated;
  }

  async remove(key: string): Promise<void> {
    this.data.delete(key);
  }

  async clear(): Promise<void> {
    this.data.clear();
  }
}

/**
 * Chrome storage adapter
 * Wraps chrome.storage API
 */
export class ChromeStorageAdapter implements IStorageAdapter {
  constructor(private storage: chrome.storage.StorageArea) {}

  async get<T>(key: string): Promise<T | null> {
    const result = await this.storage.get(key);
    return (result[key] as T) || null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.storage.set({ [key]: value });
  }

  async update<T>(key: string, updates: Partial<T>): Promise<T> {
    const existing = await this.get<T>(key);
    const updated = { ...(existing || ({} as T)), ...updates };
    await this.set(key, updated);
    return updated;
  }

  async remove(key: string): Promise<void> {
    await this.storage.remove(key);
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }
}

/**
 * Create Chrome storage adapters
 */
export function createChromeLocalAdapter(): IStorageAdapter {
  return new ChromeStorageAdapter(chrome.storage.local);
}

export function createChromeSyncAdapter(): IStorageAdapter {
  return new ChromeStorageAdapter(chrome.storage.sync);
}

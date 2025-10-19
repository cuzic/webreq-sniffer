/**
 * Settings Context
 * Provides global settings state management using Context API
 *
 * Benefits:
 * - Eliminates props drilling
 * - Single source of truth for settings
 * - Automatic re-rendering when settings change
 * - Type-safe access to settings
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Settings } from '@/types';
import { defaultSettings } from '@/types/schemas';
import { getSettings as fetchSettings, updateSettings as saveSettings } from '@/options/messaging';
import { Logger } from '@/lib/logger';

/**
 * Settings Context Value
 */
interface SettingsContextValue {
  /**
   * Current settings
   */
  settings: Settings;

  /**
   * Update settings (merges with existing settings)
   * @param updates Partial settings to update
   */
  updateSettings: (updates: Partial<Settings>) => void;

  /**
   * Save settings to storage
   * @returns Promise that resolves when settings are saved
   */
  saveSettings: () => Promise<void>;

  /**
   * Reload settings from storage
   * @returns Promise that resolves when settings are loaded
   */
  reloadSettings: () => Promise<void>;

  /**
   * Whether settings are being loaded
   */
  loading: boolean;

  /**
   * Whether settings are being saved
   */
  saving: boolean;

  /**
   * Whether settings were just saved (for showing success feedback)
   */
  saved: boolean;

  /**
   * Whether there are unsaved changes
   */
  hasUnsavedChanges: boolean;
}

/**
 * Settings Context
 */
const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Settings Provider Props
 */
interface SettingsProviderProps {
  children: ReactNode;
}

/**
 * Settings Provider Component
 * Wraps the Options page to provide settings state
 *
 * @example
 * ```tsx
 * <SettingsProvider>
 *   <Options />
 * </SettingsProvider>
 * ```
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Load settings from storage
   */
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await fetchSettings();
      setSettings(loaded);
      setOriginalSettings(loaded);
    } catch (error) {
      Logger.error('SettingsContext', error, { context: 'loadSettings' });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update settings in state (does not save to storage)
   */
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Save settings to storage
   */
  const saveSettingsToStorage = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveSettings(settings);
      setOriginalSettings(settings);
      setSaved(true);

      // Reset saved indicator after 2 seconds
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      Logger.error('SettingsContext', error, { context: 'saveSettings' });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [settings]);

  /**
   * Reload settings from storage (discards unsaved changes)
   */
  const reloadSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  /**
   * Check if there are unsaved changes
   */
  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const value: SettingsContextValue = {
    settings,
    updateSettings,
    saveSettings: saveSettingsToStorage,
    reloadSettings,
    loading,
    saving,
    saved,
    hasUnsavedChanges,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * Custom hook to access settings context
 *
 * @throws {Error} If used outside SettingsProvider
 * @returns Settings context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { settings, updateSettings } = useSettings();
 *
 *   const handleChange = () => {
 *     updateSettings({ monitoring: true });
 *   };
 *
 *   return <button onClick={handleChange}>Enable Monitoring</button>;
 * }
 * ```
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
}

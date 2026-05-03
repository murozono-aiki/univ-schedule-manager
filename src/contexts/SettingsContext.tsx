import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { syncSettingsFromDrive, saveSettingsToDrive } from '../services/settingsApi.ts';
import { useAuth } from './AuthContext';

export interface PeriodDef {
  id: number;
  label: string;  // e.g. '1限'
  startTime: string;  // 'HH:mm'
  endTime: string;    // 'HH:mm'
}

export interface AppSettings {
  weekStart: 'sunday' | 'monday';
  periods: PeriodDef[];
}

const DEFAULT_PERIODS: PeriodDef[] = [
  { id: 1, label: '1限', startTime: '08:50', endTime: '10:30' },
  { id: 2, label: '2限', startTime: '10:40', endTime: '12:20' },
  { id: 3, label: '3限', startTime: '13:10', endTime: '14:50' },
  { id: 4, label: '4限', startTime: '15:00', endTime: '16:40' },
  { id: 5, label: '5限', startTime: '16:50', endTime: '18:30' },
  { id: 6, label: '6限', startTime: '18:40', endTime: '20:20' },
];

const DEFAULT_SETTINGS: AppSettings = {
  weekStart: 'sunday',
  periods: DEFAULT_PERIODS,
};

const STORAGE_KEY = 'app_settings';
// Debounce delay (ms) before auto-saving edits to Drive
const AUTO_SAVE_DELAY = 1500;

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updated: Partial<AppSettings>) => void;
  syncFromDrive: () => Promise<void>;
  syncToDrive: () => Promise<void>;
  isSyncing: boolean;
  lastSynced: Date | null;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken } = useAuth();

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) return JSON.parse(cached) as AppSettings;
    } catch { /* ignore */ }
    return DEFAULT_SETTINGS;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Flag: true when settings were just loaded from Drive (avoids auto-save loop)
  const isDriveUpdate = useRef(false);
  // Debounce timer ref for auto-save
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Auto-save to Drive (debounced) whenever settings change due to user edits
  useEffect(() => {
    if (!accessToken || isDriveUpdate.current) {
      isDriveUpdate.current = false;
      return;
    }

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await saveSettingsToDrive(accessToken, settings);
        setLastSynced(new Date());
      } catch (e) {
        console.error('Auto-save to Drive failed:', e);
      } finally {
        setIsSyncing(false);
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [settings, accessToken]);  // eslint-disable-line react-hooks/exhaustive-deps

  const updateSettings = useCallback((updated: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updated }));
  }, []);

  const syncFromDrive = useCallback(async () => {
    if (!accessToken) return;
    setIsSyncing(true);
    try {
      const remote = await syncSettingsFromDrive(accessToken);
      if (remote) {
        // Mark as Drive-originated so auto-save doesn't fire
        isDriveUpdate.current = true;
        setSettings(remote);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      }
      setLastSynced(new Date());
    } catch (e) {
      console.error('Failed to sync from Drive:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [accessToken]);

  const syncToDrive = useCallback(async () => {
    if (!accessToken) return;
    setIsSyncing(true);
    try {
      await saveSettingsToDrive(accessToken, settings);
      setLastSynced(new Date());
    } catch (e) {
      console.error('Failed to sync to Drive:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [accessToken, settings]);

  // Auto-sync FROM Drive on login (background, on page load)
  useEffect(() => {
    if (accessToken) {
      syncFromDrive();
    }
  }, [accessToken]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, syncFromDrive, syncToDrive, isSyncing, lastSynced }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

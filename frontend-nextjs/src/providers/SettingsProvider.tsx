import {
  createContext,
  useMemo,
  useContext,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';
import type { PublicSettingItem, PublicSettingsMap } from '@/types/settings';

const SETTINGS_QUERY_KEY = ['settings', 'public'] as const;
const STALE_TIME_MS = 1000 * 60 * 10; // 10 minutes

interface ApiResponse {
  success?: boolean;
  data?: PublicSettingItem[];
}

async function fetchPublicSettings(): Promise<PublicSettingsMap> {
  const response = await apiClient.get<ApiResponse>('/settings/public');
  const data = response.data?.data;
  if (!Array.isArray(data)) return {};
  return data.reduce<PublicSettingsMap>(
    (acc, { key, value }) => ({ ...acc, [key]: value }),
    {}
  );
}

interface SettingsContextValue {
  settings: PublicSettingsMap;
  isLoading: boolean;
  error: Error | null;
  /** Get string value with optional fallback */
  get: (key: string) => unknown;
  getString: (key: string, fallback?: string) => string;
  getBoolean: (key: string, fallback?: boolean) => boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: settings = {}, isLoading, error } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: fetchPublicSettings,
    staleTime: STALE_TIME_MS,
    gcTime: STALE_TIME_MS * 2,
  });

  const value = useMemo<SettingsContextValue>(() => ({
    settings,
    isLoading,
    error: error ?? null,
    get: (key: string) => settings[key],
    getString: (key: string, fallback = '') => {
      const v = settings[key];
      return typeof v === 'string' ? v : fallback;
    },
    getBoolean: (key: string, fallback = false) => {
      const v = settings[key];
      if (typeof v === 'boolean') return v;
      if (v === 'true' || v === 1) return true;
      if (v === 'false' || v === 0) return false;
      return fallback;
    },
  }), [settings, isLoading, error]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}

export function useSettingsOptional(): SettingsContextValue | null {
  return useContext(SettingsContext);
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'dark' | 'light' | 'system'

/**
 * useThemeStore: Sidebar expansion + UI theme (light/dark/system) persisted to localStorage.
 * Theme is applied by ThemeProvider which subscribes to theme and updates document.documentElement.
 */
interface ThemeState {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleSidebarExpanded: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      sidebarExpanded: false,
      setSidebarExpanded: (sidebarExpanded) => set({ sidebarExpanded }),
      toggleSidebarExpanded: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
)

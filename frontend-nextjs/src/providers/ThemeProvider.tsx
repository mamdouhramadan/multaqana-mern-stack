import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useThemeStore, type ThemeMode } from "@/store/useThemeStore";

/**
 * ThemeProvider: Subscribes to theme from useThemeStore (Zustand) and applies it to document.
 * Drives document.documentElement classList for Tailwind dark mode.
 * useTheme() returns theme, resolvedTheme, and setTheme (delegates to store).
 */
type ResolvedTheme = "light" | "dark";

type ThemeProviderState = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
};

type ThemeProviderProps = {
  children: React.ReactNode;
};

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      root.setAttribute("data-theme", systemTheme);
      setResolvedTheme(systemTheme);
      return;
    }

    root.classList.add(theme);
    root.setAttribute("data-theme", theme);
    setResolvedTheme(theme);
  }, [theme]);

  const value = useMemo<ThemeProviderState>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

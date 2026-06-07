import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeName = "blood" | "midnight" | "ash" | "ember";
const THEMES: ThemeName[] = ["blood", "midnight", "ash", "ember"];
const STORAGE_KEY = "mt-theme";

interface ThemeCtx {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  themes: ThemeName[];
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("blood");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEY) as ThemeName)) || "blood";
    if (THEMES.includes(saved)) setThemeState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    THEMES.forEach((t) => root.classList.remove(`theme-${t}`));
    root.classList.add(`theme-${theme}`);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);

  return <Ctx.Provider value={{ theme, setTheme, themes: THEMES }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used within ThemeProvider");
  return v;
}

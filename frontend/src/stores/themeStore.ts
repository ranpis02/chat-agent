import { create } from "zustand";

import { storage } from "@/utils/storage";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  theme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  initialize: () => void;
}

const systemTheme = (): ResolvedTheme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
}

let listeningToSystem = false;

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  theme: "light",
  setTheme: (mode) => {
    storage.setTheme(mode);
    const theme = mode === "system" ? systemTheme() : mode;
    applyTheme(theme);
    set({ mode, theme });
  },
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    get().setTheme(next);
  },
  initialize: () => {
    const stored = storage.getTheme();
    const mode: ThemeMode = stored === "light" || stored === "dark" ? stored : "system";
    const theme = mode === "system" ? systemTheme() : mode;
    applyTheme(theme);
    set({ mode, theme });

    if (!listeningToSystem) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", (event) => {
        if (useThemeStore.getState().mode !== "system") return;
        const next = event.matches ? "dark" : "light";
        applyTheme(next);
        useThemeStore.setState({ theme: next });
      });
      listeningToSystem = true;
    }
  }
}));

import * as React from "react";
import { Menu, Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chatStore";
import { useThemeStore, type ThemeMode } from "@/stores/themeStore";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { currentSessionId, sessions } = useChatStore();
  const mode = useThemeStore((state) => state.mode);
  const setTheme = useThemeStore((state) => state.setTheme);
  const currentSession = React.useMemo(
    () => sessions.find((session) => session.id === currentSessionId),
    [sessions, currentSessionId]
  );

  const nextMode: Record<ThemeMode, ThemeMode> = {
    system: "light",
    light: "dark",
    dark: "system"
  };
  const ThemeIcon = mode === "system" ? Monitor : mode === "light" ? Sun : Moon;
  const themeLabel = mode === "system" ? "跟随系统" : mode === "light" ? "浅色模式" : "深色模式";

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-[#212121]">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label="切换侧边栏"
            className="text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <p className="text-base font-medium text-gray-900 dark:text-[#ececec]">
            {currentSession?.title || "新对话"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(nextMode[mode])}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100"
            aria-label={`当前${themeLabel}，点击切换`}
            title={`主题：${themeLabel}`}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

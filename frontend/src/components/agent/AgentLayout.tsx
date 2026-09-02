import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { AgentRawLog } from "@/components/agent/AgentRawLog";
import { AgentSidebar } from "@/components/agent/AgentSidebar";
import { getAgentMeta } from "@/services/agentService";
import { useThemeStore, type ThemeMode } from "@/stores/themeStore";
import type { AgentEngineMeta } from "@/types/agent";

export type AgentMetaState =
  | { status: "probing" }
  | { status: "online"; meta: AgentEngineMeta }
  | { status: "offline"; message: string };

// 进页拉一次 /agent/v1/meta 点亮徽标与框架信息块
function useAgentMeta(): AgentMetaState {
  const [state, setState] = React.useState<AgentMetaState>({ status: "probing" });

  React.useEffect(() => {
    let alive = true;
    getAgentMeta()
      .then((meta) => {
        if (alive) setState({ status: "online", meta });
      })
      .catch((error) => {
        if (alive) {
          setState({ status: "offline", message: (error as Error).message || "连接失败" });
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

interface AgentHeaderProps {
  meta: AgentMetaState;
  rawOpen: boolean;
  onToggleRaw: () => void;
}

function AgentHeader({ meta, rawOpen, onToggleRaw }: AgentHeaderProps) {
  const mode = useThemeStore((state) => state.mode);
  const setTheme = useThemeStore((state) => state.setTheme);
  const nextMode: Record<ThemeMode, ThemeMode> = {
    system: "light",
    light: "dark",
    dark: "system"
  };
  const themeLabel = mode === "system" ? "跟随系统" : mode === "light" ? "浅色模式" : "深色模式";
  const ThemeIcon = mode === "system" ? Monitor : mode === "light" ? Sun : Moon;

  const badgeName =
    meta.status === "online" ? meta.meta.framework : meta.status === "probing" ? "探测中" : "离线";

  return (
    <header className="agent-header">
      <div className="agent-brand">
        <span className="agent-brand-mark" aria-hidden="true">A</span>
        <span className="agent-wordmark">AGENT 智能问答平台</span>
      </div>

      <div className="agent-header-center">
        <span className="agent-badge">
          <span className="agent-dot" data-status={meta.status} aria-hidden="true" />
          <span className="agent-badge-name">{badgeName}</span>
        </span>
        {meta.status === "online" ? (
          <span className="agent-badge-model">{meta.meta.model || "未配模型"}</span>
        ) : null}
        {meta.status === "offline" ? (
          <span className="agent-badge-err" title={meta.message}>
            连接失败
          </span>
        ) : null}
      </div>

      <div className="agent-header-right">
        <button
          type="button"
          className="agent-head-btn"
          onClick={() => setTheme(nextMode[mode])}
          aria-label={`当前${themeLabel}，点击切换`}
          title={`主题：${themeLabel}`}
        >
          <ThemeIcon className="h-4 w-4" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="agent-head-btn"
          data-on={rawOpen}
          onClick={onToggleRaw}
          aria-pressed={rawOpen}
        >
          <span className="agent-btn-glyph">{"{ }"}</span> 原始帧
        </button>
      </div>
    </header>
  );
}

interface AgentLayoutProps {
  children: React.ReactNode;
}

export function AgentLayout({ children }: AgentLayoutProps) {
  const [rawOpen, setRawOpen] = React.useState(false);
  const meta = useAgentMeta();

  return (
    <div className="agent-app">
      <AgentHeader meta={meta} rawOpen={rawOpen} onToggleRaw={() => setRawOpen((v) => !v)} />
      <div className="agent-body">
        <AgentSidebar />
        <main className="agent-main">{children}</main>
        {rawOpen ? <AgentRawLog onClose={() => setRawOpen(false)} /> : null}
      </div>
    </div>
  );
}

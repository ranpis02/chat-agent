import * as React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { listSampleQuestions } from "@/services/sampleQuestionService";
import { useAgentChatStore } from "@/stores/agentChatStore";
import { useAuthStore } from "@/stores/authStore";

const SAMPLE_LIMIT = 4;

type SampleState =
  | { status: "loading" }
  | { status: "ready"; items: string[] }
  | { status: "error" };

let cachedQuestions: string[] | null = null;

function useSampleQuestions() {
  const [state, setState] = React.useState<SampleState>(() =>
    cachedQuestions ? { status: "ready", items: cachedQuestions } : { status: "loading" }
  );

  const load = React.useCallback(() => {
    setState({ status: "loading" });
    listSampleQuestions(SAMPLE_LIMIT)
      .then((rows) => {
        const items = (rows ?? [])
          .map((row) => row.question?.trim())
          .filter((question): question is string => Boolean(question));
        cachedQuestions = items;
        setState({ status: "ready", items });
      })
      .catch(() => setState({ status: "error" }));
  }, []);

  React.useEffect(() => {
    if (!cachedQuestions) load();
  }, [load]);

  return { state, reload: load };
}

function SampleQuestions() {
  const setDraft = useAgentChatStore((store) => store.setDraft);
  const isAdmin = useAuthStore((store) => store.user?.role === "admin");
  const { state, reload } = useSampleQuestions();

  if (state.status === "loading") return null;

  const questions = state.status === "ready" ? state.items : [];
  if (questions.length === 0) {
    return (
      <div className="agent-empty-blank">
        <p>
          {state.status === "error" ? "示例问题暂时未能加载，你仍然可以直接开始提问。" : "直接在下方输入你想了解的问题。"}
          {isAdmin && state.status !== "error" ? (
            <>
              {" "}
              <a className="agent-empty-blank-link" href="/admin/sample-questions" target="_blank" rel="noreferrer">
                配置示例问题
              </a>
            </>
          ) : null}
        </p>
        {state.status === "error" ? (
          <button type="button" className="agent-empty-blank-btn" onClick={reload}>重试</button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="agent-empty-chips">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          className="agent-empty-chip"
          onClick={() => setDraft(question)}
        >
          <span>{question}</span>
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function AgentWelcomeScreen() {
  return (
    <div className="agent-stream-empty">
      <div className="agent-empty-wrap">
        <div className="agent-empty-hero">
          <span className="agent-empty-logo" aria-hidden="true">
            <Sparkles className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <h1>有什么可以帮忙的？</h1>
          <p>你可以询问知识库内容、分析问题，或让 AGENT 帮你完成一项任务。</p>
        </div>
        <SampleQuestions />
      </div>
    </div>
  );
}

"use client";

import { useCallback, useRef, useState } from "react";
import { ALL_AGENTS, SPEAKING_ORDER, type AgentName } from "@/lib/agents";
import type { CouncilEvent } from "@/lib/events";
import { type DecisionReport, type VerdictSections } from "@/lib/report";

export type AgentStatus = "waiting" | "speaking" | "done" | "error";

export interface AgentState {
  status: AgentStatus;
  text: string;
  error?: string;
  /** Epoch ms when this member began speaking. */
  at?: number;
}

export type Phase = "idle" | "summoning" | "running" | "complete" | "error";

export interface CouncilState {
  phase: Phase;
  agents: Record<AgentName, AgentState>;
  verdict: VerdictSections | null;
  verdictMarkdown: string;
  error: string | null;
  decisionText: string;
  startedAt: string | null;
  persisted: boolean;
}

const freshAgents = (): Record<AgentName, AgentState> =>
  Object.fromEntries(SPEAKING_ORDER.map((n) => [n, { status: "waiting", text: "" }])) as Record<
    AgentName,
    AgentState
  >;

const INITIAL: CouncilState = {
  phase: "idle",
  agents: freshAgents(),
  verdict: null,
  verdictMarkdown: "",
  error: null,
  decisionText: "",
  startedAt: null,
  persisted: false,
};

export function useCouncil() {
  const [state, setState] = useState<CouncilState>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState((s) => (s.phase === "running" || s.phase === "summoning" ? { ...s, phase: "idle" } : s));
  }, []);

  const apply = useCallback((ev: CouncilEvent) => {
    setState((s) => {
      switch (ev.type) {
        case "session":
          return { ...s, persisted: ev.persisted };
        case "agent_start":
          return {
            ...s,
            phase: "running",
            agents: { ...s.agents, [ev.agent]: { status: "speaking", text: "", at: Date.now() } },
          };
        case "delta": {
          const cur = s.agents[ev.agent];
          return {
            ...s,
            agents: { ...s.agents, [ev.agent]: { ...cur, status: "speaking", text: cur.text + ev.text } },
          };
        }
        case "agent_done":
          return {
            ...s,
            agents: { ...s.agents, [ev.agent]: { ...s.agents[ev.agent], status: "done", text: ev.text } },
          };
        case "agent_error": {
          const cur = s.agents[ev.agent];
          return {
            ...s,
            agents: { ...s.agents, [ev.agent]: { ...cur, status: "error", error: ev.message } },
          };
        }
        case "verdict":
          return { ...s, verdict: ev.sections, verdictMarkdown: ev.markdown };
        case "error":
          return { ...s, phase: "error", error: ev.message };
        case "done":
          return { ...s, phase: "complete" };
        default:
          return s;
      }
    });
  }, []);

  const analyze = useCallback(
    async (decisionText: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        ...INITIAL,
        agents: freshAgents(),
        phase: "summoning",
        decisionText,
        startedAt: new Date().toISOString(),
      });

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision_text: decisionText }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let message = `The council did not answer (HTTP ${res.status}).`;
          try {
            const j = (await res.json()) as { error?: string };
            if (j.error) message = j.error;
          } catch {
            /* non-JSON error body */
          }
          setState((s) => ({ ...s, phase: "error", error: message }));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let sawDone = false;

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (!line) continue;
            try {
              const ev = JSON.parse(line) as CouncilEvent;
              if (ev.type === "done" || ev.type === "error") sawDone = true;
              apply(ev);
            } catch {
              console.warn("[council] bad event line", line);
            }
          }
        }
        if (!sawDone) {
          setState((s) =>
            s.phase === "complete" || s.phase === "error"
              ? s
              : { ...s, phase: "error", error: "The connection to the council closed early." },
          );
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setState((s) => ({
          ...s,
          phase: "error",
          error: err instanceof Error ? err.message : "Something interrupted the trial.",
        }));
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [apply],
  );

  const report: DecisionReport | null =
    state.verdict && state.startedAt
      ? {
          decisionText: state.decisionText,
          createdAt: state.startedAt,
          responses: SPEAKING_ORDER.filter((n) => n !== "Eleven")
            .map((n) => ({ agent: n, role: ALL_AGENTS[n].role, text: state.agents[n].text }))
            .filter((r) => r.text.trim().length > 0),
          verdictMarkdown: state.verdictMarkdown,
          verdict: state.verdict,
        }
      : null;

  return { state, report, analyze, cancel, reset };
}

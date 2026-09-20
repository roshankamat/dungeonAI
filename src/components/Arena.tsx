"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCouncil } from "@/hooks/useCouncil";
import { SPEAKING_ORDER } from "@/lib/agents";
import type { DecisionReport } from "@/lib/report";
import { SceneBackground } from "./SceneBackground";
import { SummonOverlay } from "./SummonOverlay";
import { TopNav } from "./TopNav";
import { Sidebar } from "./chat/Sidebar";
import { ChatPanel } from "./chat/ChatPanel";
import { MissionPanel } from "./chat/MissionPanel";
import type { Channel, ChatMessage } from "./chat/types";

const SUMMON_MS = 2400;
const INTRO: ChatMessage = {
  id: "intro",
  kind: "intro",
  agent: "Max",
  text: "Bold decisions get tested here. **What are you deciding today?** Pricing, hiring, quitting, raising, building. Bring the real question and the council will convene.",
  at: 0,
};

export function Arena() {
  const params = useSearchParams();
  const [draft, setDraft] = useState(() => params.get("q") ?? "");
  const [channel, setChannel] = useState<Channel>("general");
  const [history, setHistory] = useState<DecisionReport[]>([]);
  const [viewing, setViewing] = useState<DecisionReport | null>(null);
  const [showSummon, setShowSummon] = useState(false);
  const [introAt] = useState(() => Date.now());
  const summonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { state, report, analyze, cancel } = useCouncil();
  const busy = state.phase === "summoning" || state.phase === "running";

  // Archive each completed trial for this session.
  useEffect(() => {
    if (report && state.phase === "complete") {
      setHistory((h) => (h.some((r) => r.createdAt === report.createdAt) ? h : [report, ...h]));
    }
  }, [report, state.phase]);

  useEffect(
    () => () => {
      if (summonTimer.current) clearTimeout(summonTimer.current);
    },
    [],
  );

  const send = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setViewing(null);
    setChannel("general");
    setShowSummon(true);
    if (summonTimer.current) clearTimeout(summonTimer.current);
    summonTimer.current = setTimeout(() => setShowSummon(false), SUMMON_MS);
    void analyze(text);
    setDraft("");
  };

  const stop = () => {
    if (summonTimer.current) clearTimeout(summonTimer.current);
    setShowSummon(false);
    cancel();
  };

  const retry = () => {
    if (!state.decisionText) return;
    setDraft(state.decisionText);
    setTimeout(() => {
      setDraft("");
      setShowSummon(true);
      summonTimer.current = setTimeout(() => setShowSummon(false), SUMMON_MS);
      void analyze(state.decisionText);
    }, 0);
  };

  // Build the transcript, either from the live trial or from an archived one.
  const messages = useMemo<ChatMessage[]>(() => {
    const out: ChatMessage[] = [{ ...INTRO, at: introAt }];
    if (viewing) {
      const t = new Date(viewing.createdAt).getTime();
      out.push({ id: `u-${t}`, kind: "user", text: viewing.decisionText, at: t });
      viewing.responses.forEach((r, i) =>
        out.push({ id: `a-${t}-${r.agent}`, kind: "agent", agent: r.agent, text: r.text, status: "done", at: t + (i + 1) * 1000 }),
      );
      out.push({ id: `v-${t}`, kind: "verdict", agent: "Eleven", report: viewing, at: t + 7000 });
      return filterChannel(out, channel);
    }
    if (state.decisionText && state.startedAt) {
      const t = new Date(state.startedAt).getTime();
      out.push({ id: `u-${t}`, kind: "user", text: state.decisionText, at: t });
      for (const name of SPEAKING_ORDER) {
        const st = state.agents[name];
        if (st.status === "waiting") continue;
        if (name === "Eleven" && report) {
          out.push({ id: `v-${t}`, kind: "verdict", agent: "Eleven", report, at: st.at ?? Date.now() });
        } else {
          out.push({ id: `a-${t}-${name}`, kind: "agent", agent: name, text: st.text, status: st.status, error: st.error, at: st.at ?? Date.now() });
        }
      }
    }
    return filterChannel(out, channel);
  }, [viewing, state, report, channel, introAt]);

  return (
    <main className="relative flex min-h-dvh flex-col">
      <SceneBackground reflection={false} intensity={0.5} />
      <SummonOverlay show={showSummon && busy} />
      <TopNav cta={false} />

      <div className="relative z-10 mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-[minmax(0,1fr)] gap-5 px-4 pb-6 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_290px]">
        <Sidebar
          className="hidden lg:flex"
          channel={channel}
          onChannel={setChannel}
          agents={state.agents}
          history={history}
          onOpenHistory={setViewing}
          activeHistory={viewing}
        />

        <ChatPanel
          className="h-[calc(100dvh-110px)] min-h-[560px]"
          channel={channel}
          onChannel={setChannel}
          messages={messages}
          agents={state.agents}
          value={draft}
          onChange={setDraft}
          onSend={send}
          onCancel={stop}
          busy={busy}
          readOnly={false}
          error={viewing ? null : state.error}
          onRetry={retry}
        />

        <MissionPanel className="hidden xl:flex" agents={state.agents} phase={state.phase} persisted={state.persisted} />
      </div>
    </main>
  );
}

function filterChannel(messages: ChatMessage[], channel: Channel): ChatMessage[] {
  if (channel === "general") return messages;
  return messages.filter((m) => m.kind === "user" || ("agent" in m && m.agent === channel && m.kind !== "intro"));
}

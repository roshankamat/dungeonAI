"use client";

import { ArrowRight, Database } from "lucide-react";
import { COUNCIL, JUDGE, type AgentName } from "@/lib/agents";
import type { AgentState, Phase } from "@/hooks/useCouncil";
import { AgentAvatar } from "../AgentAvatar";
import { cn } from "@/lib/utils";

const TOTAL = COUNCIL.length + 1;

export function MissionPanel({
  agents,
  phase,
  persisted,
  className,
}: {
  agents: Record<AgentName, AgentState>;
  phase: Phase;
  persisted: boolean;
  className?: string;
}) {
  const done = Object.values(agents).filter((a) => a.status === "done" || a.status === "error").length;
  const pct = Math.round((done / TOTAL) * 100);
  const missionTitle =
    phase === "idle" ? "Validate Your Decision" : phase === "complete" ? "Verdict Delivered" : phase === "error" ? "Trial Interrupted" : "Trial In Session";

  return (
    <aside className={cn("flex flex-col gap-4", className)}>
      <p className="px-1 text-[11px] uppercase leading-5 tracking-[0.3em] text-neon">
        Ideas
        <br />
        belong
        <br />
        on trial.
      </p>

      <section className="panel rounded-md p-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-stone-400">
          Current mission <ArrowRight className="size-3.5" />
        </div>
        <h3 className="mt-3 text-sm text-stone-50">{missionTitle}</h3>
        <p className="mt-2 text-xs leading-5 text-stone-500">
          Get brutal feedback from the council and refine your decision before you act.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-800">
            <div
              className="h-full bg-neon shadow-[0_0_10px_var(--neon)] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-stone-400">
            {done}/{TOTAL}
          </span>
        </div>
      </section>

      <blockquote className="px-1 text-[11px] uppercase leading-6 tracking-[0.25em] text-neon/90">
        “Fear is a good testing environment.”
        <br />
        <span className="text-neon/60">— Vecna</span>
      </blockquote>

      <section className="panel rounded-md p-4">
        <div className="flex items-center gap-2 px-1 text-[11px] uppercase tracking-[0.3em] text-stone-400">
          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" /> Active in dungeon
        </div>
        <ul className="mt-3 flex flex-col gap-1">
          {[...COUNCIL, JUDGE].map((agent) => {
            const st = agents[agent.name];
            const label =
              st.status === "speaking" ? "Speaking" : st.status === "done" ? "Done" : st.status === "error" ? "Silent" : "Online";
            const dot =
              st.status === "speaking"
                ? "bg-neon shadow-[0_0_8px_var(--neon)] animate-pulse"
                : st.status === "done"
                  ? "bg-emerald-400"
                  : st.status === "error"
                    ? "bg-amber-400"
                    : "bg-emerald-500/70";
            return (
              <li key={agent.name} className="flex items-center gap-3 rounded-sm px-1 py-1.5">
                <AgentAvatar agent={agent} size="xs" active={st.status === "speaking"} />
                <span className="text-sm text-stone-200">{agent.name}</span>
                <span className="rounded-[2px] border border-neon/70 px-1 py-px text-[9px] leading-none tracking-widest text-neon">
                  AI
                </span>
                <span className="ml-auto flex items-center gap-1.5 text-[11px] text-stone-500">
                  <span className={cn("size-1.5 rounded-full", dot)} />
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
        {persisted && (
          <p className="mt-3 flex items-center gap-1.5 px-1 text-[10px] uppercase tracking-widest text-stone-600">
            <Database className="size-3" /> Trial recorded
          </p>
        )}
      </section>

      <div className="mt-auto flex justify-end pr-2 pt-2">
        <div className="-rotate-3 border-2 border-stone-500/60 bg-[#1a1416] px-4 py-3 text-center font-display text-lg uppercase leading-tight tracking-wide text-stone-300 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]">
          Better
          <br />
          founders
          <br />
          on the
          <br />
          other side.
        </div>
      </div>
    </aside>
  );
}

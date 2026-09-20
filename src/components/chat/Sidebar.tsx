"use client";

import { Archive, Hash, MessageSquare } from "lucide-react";
import { COUNCIL, JUDGE, type AgentName } from "@/lib/agents";
import type { AgentState } from "@/hooks/useCouncil";
import type { DecisionReport } from "@/lib/report";
import { AgentAvatar } from "../AgentAvatar";
import { cn } from "@/lib/utils";
import type { Channel } from "./types";

export function Sidebar({
  channel,
  onChannel,
  agents,
  history,
  onOpenHistory,
  activeHistory,
  className,
}: {
  channel: Channel;
  onChannel: (c: Channel) => void;
  agents: Record<AgentName, AgentState>;
  history: DecisionReport[];
  onOpenHistory: (r: DecisionReport | null) => void;
  activeHistory: DecisionReport | null;
  className?: string;
}) {
  return (
    <aside className={cn("panel flex flex-col rounded-md", className)}>
      <div className="px-5 pt-5 pb-3 text-[11px] uppercase tracking-[0.3em] text-stone-400">The Dungeon</div>

      <nav className="flex flex-col gap-1 px-3">
        <ChannelButton
          active={channel === "general" && !activeHistory}
          onClick={() => {
            onOpenHistory(null);
            onChannel("general");
          }}
          icon={<MessageSquare className="size-4" />}
          title="General"
          subtitle="Chat with the council"
        />
        {[...COUNCIL, JUDGE].map((agent) => {
          const st = agents[agent.name];
          return (
            <ChannelButton
              key={agent.name}
              active={channel === agent.name && !activeHistory}
              onClick={() => {
                onOpenHistory(null);
                onChannel(agent.name);
              }}
              icon={<AgentAvatar agent={agent} size="sm" active={st.status === "speaking"} />}
              title={agent.name}
              subtitle={agent.tagline}
              badge={
                st.status === "speaking" ? (
                  <span className="size-1.5 rounded-full bg-neon shadow-[0_0_8px_var(--neon)]" />
                ) : st.status === "done" ? (
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                ) : st.status === "error" ? (
                  <span className="size-1.5 rounded-full bg-amber-400" />
                ) : null
              }
            />
          );
        })}
      </nav>

      <div className="mt-6 px-5 pb-3 text-[11px] uppercase tracking-[0.3em] text-stone-400">Archives</div>
      <div className="flex flex-col gap-1 px-3 pb-5">
        {history.length === 0 ? (
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-stone-600">
            <Archive className="size-4" /> Past trials appear here
          </div>
        ) : (
          history.map((r) => (
            <button
              key={r.createdAt}
              type="button"
              onClick={() => onOpenHistory(r)}
              className={cn(
                "flex items-start gap-3 rounded-sm px-3 py-2 text-left transition",
                activeHistory?.createdAt === r.createdAt ? "bg-neon/10 text-stone-100" : "text-stone-400 hover:bg-white/5 hover:text-stone-200",
              )}
            >
              <Hash className="mt-0.5 size-3.5 shrink-0 text-neon-dim" />
              <span className="line-clamp-2 text-xs leading-5">{r.decisionText}</span>
            </button>
          ))
        )}
      </div>

      <div className="mt-auto px-5 pb-6 pt-4">
        <p className="text-[10px] uppercase leading-5 tracking-[0.3em] text-stone-600">
          Ideas go in.
          <br />
          Founders come out.
        </p>
      </div>
    </aside>
  );
}

function ChannelButton({
  active,
  onClick,
  icon,
  title,
  subtitle,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-sm border px-3 py-2 text-left transition",
        active
          ? "border-neon/50 bg-neon/10 shadow-[inset_3px_0_0_var(--neon),0_0_18px_-6px_rgba(255,43,43,0.7)]"
          : "border-transparent hover:bg-white/5",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center text-neon">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-stone-100">{title}</span>
        <span className="block truncate text-[11px] text-stone-500">{subtitle}</span>
      </span>
      {badge}
    </button>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { Hash, TriangleAlert, Users } from "lucide-react";
import { ALL_AGENTS, COUNCIL, JUDGE, type AgentName } from "@/lib/agents";
import type { AgentState } from "@/hooks/useCouncil";
import { AgentAvatar } from "../AgentAvatar";
import { Composer } from "./Composer";
import { MessageBubble } from "./MessageBubble";
import type { Channel, ChatMessage } from "./types";
import { cn } from "@/lib/utils";

export function ChatPanel({
  channel,
  onChannel,
  messages,
  agents,
  value,
  onChange,
  onSend,
  onCancel,
  busy,
  readOnly,
  error,
  onRetry,
  className,
}: {
  channel: Channel;
  onChannel: (c: Channel) => void;
  messages: ChatMessage[];
  agents: Record<AgentName, AgentState>;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onCancel: () => void;
  busy: boolean;
  readOnly: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  // Follow the stream unless the user has scrolled up to read.
  const lastLen = messages.reduce((n, m) => n + ("text" in m ? m.text.length : 500), 0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !stickToBottom.current) return;
    el.scrollTop = el.scrollHeight;
  }, [lastLen, messages.length, channel]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const title = channel === "general" ? "General" : channel.toLowerCase();
  const subtitle =
    channel === "general"
      ? "Present a decision. Survive the council."
      : `${ALL_AGENTS[channel].role}. ${ALL_AGENTS[channel].tagline}.`;

  return (
    <section className={cn("panel flex min-h-0 flex-col rounded-md", className)} aria-label="Council chat">
      <header className="border-b border-neon/15 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-1.5 text-base text-stone-50">
              <Hash className="size-4 text-neon" /> {title}
            </h2>
            <p className="mt-1 truncate text-xs text-stone-500">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <Users className="size-3.5" /> 6
          </div>
        </div>

        {/* Mobile channel switcher */}
        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          <Chip active={channel === "general"} onClick={() => onChannel("general")}>
            # general
          </Chip>
          {[...COUNCIL, JUDGE].map((a) => (
            <Chip key={a.name} active={channel === a.name} onClick={() => onChannel(a.name)}>
              <AgentAvatar agent={a} size="xs" active={agents[a.name].status === "speaking"} />
              {a.name}
            </Chip>
          ))}
        </div>
      </header>

      <div ref={scrollRef} onScroll={onScroll} className="flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-5">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-sm border border-neon/40 bg-blood/30 p-4 text-sm text-red-100">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-neon" />
            <div className="flex-1">
              <p>The trial was interrupted.</p>
              <p className="mt-1 text-xs text-red-200/80">{error}</p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="neon-border rounded-sm px-3 py-1.5 text-[11px] uppercase tracking-widest text-neon hover:bg-neon/10"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <Composer value={value} onChange={onChange} onSend={onSend} onCancel={onCancel} busy={busy} disabled={readOnly} />
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] uppercase tracking-widest transition",
        active ? "border-neon/70 bg-neon/10 text-neon" : "border-stone-700 text-stone-400 hover:text-stone-200",
      )}
    >
      {children}
    </button>
  );
}

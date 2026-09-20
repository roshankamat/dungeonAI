"use client";

import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { ALL_AGENTS } from "@/lib/agents";
import { AgentAvatar } from "../AgentAvatar";
import { Markdown } from "../Markdown";
import { VerdictCard } from "./VerdictCard";
import { type ChatMessage, formatTime } from "./types";

const enter = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.kind === "user") {
    return (
      <motion.div {...enter} className="flex items-end justify-end gap-3">
        <div className="max-w-[85%] sm:max-w-[70%]">
          <div className="mb-1 flex items-baseline justify-end gap-2 text-[11px]">
            <span className="text-stone-200">You</span>
            <span className="text-stone-500">{formatTime(message.at)}</span>
          </div>
          <div className="rounded-md border border-stone-700/60 bg-[#141017] px-4 py-3 text-sm leading-6 text-stone-100 whitespace-pre-wrap">
            {message.text}
          </div>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-stone-600 bg-stone-900 text-sm text-stone-200">
          Y
        </div>
      </motion.div>
    );
  }

  const agent = ALL_AGENTS[message.agent];
  const speaking = message.kind === "agent" && message.status === "speaking";

  return (
    <motion.div {...enter} id={`msg-${message.id}`} className="flex items-start gap-3">
      <AgentAvatar agent={agent} size="md" active={speaking} />
      <div className="min-w-0 max-w-full flex-1 sm:max-w-[85%]">
        <div className="mb-1 flex flex-wrap items-baseline gap-2 text-[11px]">
          <span className="text-sm text-stone-100">{agent.name}</span>
          <span className="rounded-[2px] border border-neon/70 px-1 py-px text-[9px] leading-none tracking-widest text-neon">
            AI
          </span>
          <span className="text-stone-500">{formatTime(message.at)}</span>
          <span className="text-stone-600">{agent.role}</span>
          {speaking && <span className="ml-auto text-stone-500">speaking…</span>}
        </div>

        {message.kind === "verdict" ? (
          <VerdictCard report={message.report} />
        ) : (
          <div
            className="rounded-md border px-4 py-3"
            style={{
              borderColor: speaking ? "rgba(255,43,43,0.6)" : "rgba(255,43,43,0.28)",
              background: "rgba(10,6,8,0.85)",
              boxShadow: speaking ? "0 0 24px -10px rgba(255,43,43,0.7)" : undefined,
            }}
          >
            {message.kind === "agent" && message.status === "error" ? (
              <div className="flex items-start gap-2 text-sm text-amber-200">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <span>{message.error ?? `${agent.name} fell silent.`}</span>
              </div>
            ) : message.text ? (
              <>
                <Markdown text={message.text} className="text-sm" />
                {speaking && (
                  <span aria-hidden className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-neon animate-caret" />
                )}
              </>
            ) : (
              <Typing label={`${agent.name} is thinking`} />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Typing({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-stone-500" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block size-1.5 rounded-full bg-neon"
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
      <span className="italic">{label}…</span>
    </div>
  );
}

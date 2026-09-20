"use client";

import { useEffect, useRef } from "react";
import { Loader2, SendHorizontal, Square } from "lucide-react";

const MAX = 4000;

export function Composer({
  value,
  onChange,
  onSend,
  onCancel,
  busy,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onCancel: () => void;
  busy: boolean;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !busy && !disabled;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(200, el.scrollHeight) + "px";
  }, [value]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSend();
      }}
      className="border-t border-neon/15 px-4 pb-4 pt-3 sm:px-5"
    >
      <div className="flex items-end gap-3">
        <div className="relative flex-1">
          <textarea
            ref={ref}
            id="decision"
            rows={1}
            value={value}
            disabled={busy || disabled}
            onChange={(e) => onChange(e.target.value.slice(0, MAX))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSend) onSend();
              }
            }}
            placeholder={busy ? "The council is in session…" : "Type your decision..."}
            aria-label="Your decision"
            className="w-full resize-none rounded-sm border border-neon/30 bg-[#0c0709] px-4 py-3 text-sm leading-6 text-stone-100 placeholder:text-stone-500 focus:border-neon/70 focus:outline-none focus:ring-1 focus:ring-neon/40 disabled:opacity-60"
          />
        </div>
        {busy ? (
          <button
            type="button"
            onClick={onCancel}
            className="flex h-12 items-center gap-2 rounded-sm border border-stone-600 px-4 text-xs uppercase tracking-widest text-stone-300 transition hover:border-neon/60 hover:text-white"
            title="Dismiss the council"
          >
            <Square className="size-3.5" />
            <span className="hidden sm:inline">Dismiss</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            className="neon-border flex size-12 shrink-0 items-center justify-center rounded-sm text-neon transition hover:bg-neon/10 disabled:opacity-40 disabled:shadow-none"
            aria-label="Put this decision on trial"
          >
            {busy ? <Loader2 className="size-5 animate-spin" /> : <SendHorizontal className="size-5" />}
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-stone-600">
        <span>Ideas go in. Founders come out.</span>
        <span className="tabular-nums">
          {value.length}/{MAX}
        </span>
      </div>
    </form>
  );
}

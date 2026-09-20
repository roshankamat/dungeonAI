"use client";

import type { Agent } from "@/lib/agents";
import { useCharacterArt } from "@/hooks/useCharacterArt";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: "size-7 text-xs",
  sm: "size-9 text-sm",
  md: "size-11 text-lg",
  lg: "size-16 text-2xl",
  xl: "size-24 text-4xl",
} as const;

/**
 * Character portrait. Shows /public/characters/<name>.(png|jpg|webp) when the file
 * exists and falls back to a rune glyph so the UI works before art is uploaded.
 */
export function AgentAvatar({
  agent,
  size = "md",
  active = false,
  dimmed = false,
  className,
}: {
  agent: Agent;
  size?: keyof typeof SIZES;
  active?: boolean;
  dimmed?: boolean;
  className?: string;
}) {
  const art = useCharacterArt();
  const src = art[agent.name];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-[#0d0709] font-display font-bold transition-all duration-500",
        SIZES[size],
        active && "animate-pulse-glow",
        dimmed && "opacity-40 grayscale",
        className,
      )}
      style={
        {
          borderColor: active ? "var(--neon)" : "rgba(255,43,43,0.45)",
          color: agent.accent,
          "--glow": "var(--neon)",
          boxShadow: active ? "0 0 18px -2px rgba(255,43,43,0.8)" : "0 0 10px -6px rgba(255,43,43,0.6)",
        } as React.CSSProperties
      }
      aria-label={`${agent.name}, ${agent.role}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
      ) : (
        <span className="select-none leading-none">{agent.glyph}</span>
      )}
    </div>
  );
}

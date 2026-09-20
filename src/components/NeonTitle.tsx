"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Title-card style reveal: letters fly in from both sides and lock into place,
 * the bars slide in, then the neon settles into a slow flicker.
 */
export function NeonTitle({
  text,
  className,
  size = "lg",
  animate = true,
}: {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}) {
  const sizes = {
    sm: "text-4xl sm:text-5xl",
    md: "text-6xl sm:text-7xl md:text-8xl",
    lg: "text-[clamp(3.2rem,16vw,11rem)]",
  };
  const letters = text.split("");
  const mid = (letters.length - 1) / 2;

  return (
    <div className={cn("inline-flex flex-col items-stretch", className)}>
      <motion.span
        className="neon-bar origin-left"
        initial={animate ? { scaleX: 0, opacity: 0 } : false}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className={cn("neon-text animate-neon flex justify-center px-2 uppercase leading-[0.9]", sizes[size])} aria-label={text}>
        {letters.map((ch, i) => {
          const fromLeft = i < mid;
          return (
            <motion.span
              key={i}
              aria-hidden
              className="inline-block"
              initial={
                animate
                  ? { x: fromLeft ? "-140vw" : i > mid ? "140vw" : 0, y: i === mid ? "-60vh" : 0, scale: 2.2, opacity: 0 }
                  : false
              }
              animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + Math.abs(i - mid) * 0.12, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {ch}
            </motion.span>
          );
        })}
      </span>
      <motion.span
        className="neon-bar origin-right"
        initial={animate ? { scaleX: 0, opacity: 0 } : false}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function NeonWordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "neon-text-solid inline-block select-none uppercase leading-[0.85] tracking-tight",
        compact ? "text-lg" : "text-xl sm:text-2xl",
        className,
      )}
    >
      Founders
      <br />
      Arena
    </span>
  );
}

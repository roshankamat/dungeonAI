"use client";

import { AnimatePresence, motion } from "framer-motion";
import { COUNCIL, JUDGE } from "@/lib/agents";
import { AgentAvatar } from "./AgentAvatar";

export function SummonOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="summon"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 px-6 text-center backdrop-blur-sm font-mono"
          role="status"
          aria-live="assertive"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.05, 1], opacity: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="absolute h-[60vmin] w-[60vmin] rounded-full border border-ember/30"
            style={{ boxShadow: "0 0 120px -20px var(--color-ember), inset 0 0 80px -30px var(--color-blood)" }}
          />
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="absolute h-[52vmin] w-[52vmin] rounded-full border border-dashed border-ember/25"
          />

          <motion.h2
            initial={{ opacity: 0, letterSpacing: "0.6em", y: 10 }}
            animate={{ opacity: 1, letterSpacing: "0.25em", y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="font-display relative text-2xl font-bold uppercase text-stone-50 drop-shadow-[0_0_30px_rgba(255,77,46,0.6)] sm:text-4xl md:text-5xl"
          >
            The Council Has Been Summoned
          </motion.h2>

          <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[...COUNCIL, JUDGE].map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.18, duration: 0.5 }}
              >
                <AgentAvatar agent={agent} size="md" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

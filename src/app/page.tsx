"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { SceneBackground } from "@/components/SceneBackground";
import { NeonTitle } from "@/components/NeonTitle";
import { TopNav } from "@/components/TopNav";
import { AgentAvatar } from "@/components/AgentAvatar";
import { COUNCIL, JUDGE } from "@/lib/agents";

const STEPS = [
  { n: "01", title: "State your decision", body: "Pricing, hiring, quitting, raising, building. Bring the real question." },
  { n: "02", title: "Face the council", body: "Six AI members speak one at a time. Each attacks from a different angle." },
  { n: "03", title: "Leave with a verdict", body: "Opportunities, risks, blind spots, missing information and next actions. Exportable." },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-dvh">
      <SceneBackground />
      <TopNav />

      {/* Hero */}
      <section className="relative z-10 flex min-h-[calc(100dvh-80px)] flex-col items-center justify-center px-6 pb-24 text-center">
        {/* Side captions */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute left-8 top-1/3 hidden text-left text-[11px] uppercase leading-6 tracking-[0.3em] text-stone-500 lg:block"
        >
          Some
          <br />
          ideas
          <br />
          should
          <br />
          never
          <br />
          leave
          <br />
          the basement
          <span className="mt-4 block h-px w-8 bg-stone-600" />
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute right-8 top-1/3 hidden text-right text-[11px] uppercase leading-6 tracking-[0.3em] text-stone-500 lg:block"
        >
          The arena,
          <br />
          est. 2026
          <span className="mt-4 ml-auto block h-px w-8 bg-stone-600" />
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4 text-xs uppercase tracking-[0.5em] text-stone-300 sm:text-sm"
        >
          Welcome to the
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <NeonTitle text="Dungeon" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-6 text-sm uppercase tracking-[0.35em] text-stone-300 sm:text-base"
        >
          Ideas go in. Founders come out.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-6 max-w-xl text-balance text-sm leading-7 text-stone-400 sm:text-[15px]"
        >
          Put your decisions on trial. A council of six AI experts tests your startup instincts before the market does.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.3em] text-stone-500"
        >
          <span>Web based</span>
          <span className="text-neon/60">·</span>
          <span>No database</span>
          <span className="text-neon/60">·</span>
          <span>Nothing is stored</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-10"
        >
          <Link
            href="/arena"
            className="neon-border inline-flex items-center gap-3 rounded-sm px-8 py-4 text-sm uppercase tracking-[0.3em] text-neon transition hover:bg-neon/10 hover:shadow-[0_0_30px_rgba(255,43,43,0.5)]"
          >
            Enter the Dungeon
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>

        <motion.a
          href="#about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-6 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-stone-500 hover:text-stone-300"
        >
          <span className="block h-6 w-px bg-stone-600" />
          Scroll down
          <ChevronDown className="size-3 animate-bounce" />
        </motion.a>
      </section>

      {/* About / how it works */}
      <section id="missions" className="relative z-10 mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-neon">Missions</p>
            <h2 className="font-display mt-2 text-3xl text-stone-100 sm:text-4xl">Same questions. A stranger place.</h2>
          </div>
          <p className="hidden max-w-sm text-right text-xs leading-6 text-stone-500 md:block">
            This is not a chatbot. It is a decision trial system. Every important call gets cross-examined before you act.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="panel rounded-md p-6">
              <div className="text-xs tracking-[0.3em] text-neon">{s.n}</div>
              <h3 className="mt-3 text-sm uppercase tracking-[0.2em] text-stone-100">{s.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-400">{s.body}</p>
            </div>
          ))}
        </div>

        <div id="about" className="mt-20 scroll-mt-20">
          <p className="text-[11px] uppercase tracking-[0.35em] text-neon">About the council</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">
            Six AI members, each with one job. They speak in order, then Eleven weighs the testimony and delivers a
            verdict you can export. Everything runs in your browser session against the Claude API. No accounts, no
            database, nothing is stored.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[...COUNCIL, JUDGE].map((agent) => (
              <div key={agent.name} className="panel flex flex-col items-center gap-3 rounded-md p-5 text-center">
                <AgentAvatar agent={agent} size="lg" />
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-stone-100">{agent.name}</div>
                  <div className="mt-1 text-[11px] leading-5 text-stone-500">{agent.tagline}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center gap-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Better founders on the other side.</p>
          <Link
            href="/arena"
            className="neon-border inline-flex items-center gap-3 rounded-sm px-8 py-4 text-sm uppercase tracking-[0.3em] text-neon transition hover:bg-neon/10"
          >
            Enter the Dungeon
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

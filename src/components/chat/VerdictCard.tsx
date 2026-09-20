"use client";

import { Award, Eye, EyeOff, HelpCircle, ListChecks, Scale, ShieldAlert, Sparkles } from "lucide-react";
import type { DecisionReport, RatingItem } from "@/lib/report";
import { Markdown } from "../Markdown";
import { ExportMenu } from "../ExportMenu";

const SECTIONS = [
  { key: "opportunities", title: "Opportunities", icon: Sparkles },
  { key: "risks", title: "Risks", icon: ShieldAlert },
  { key: "blindSpots", title: "Blind Spots", icon: EyeOff },
  { key: "missingInformation", title: "Missing Information", icon: HelpCircle },
  { key: "recommendedActions", title: "Recommended Actions", icon: ListChecks },
] as const;

function getScoreColor(score: number) {
  if (score >= 8) {
    return {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      bar: "from-emerald-500 to-teal-400",
      shadow: "shadow-[0_0_12px_rgba(52,211,153,0.3)]",
    };
  }
  if (score >= 5) {
    return {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      bar: "from-amber-500 to-yellow-400",
      shadow: "shadow-[0_0_12px_rgba(251,191,36,0.3)]",
    };
  }
  return {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    bar: "from-red-600 to-rose-400",
    shadow: "shadow-[0_0_12px_rgba(248,113,113,0.3)]",
  };
}

function RatingScorecard({ ratings, markdown }: { ratings: RatingItem[]; markdown?: string }) {
  if (!ratings.length && !markdown) return null;

  const avgScore = ratings.length
    ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
    : null;

  return (
    <div className="rounded-md border border-neon/30 bg-gradient-to-br from-black/70 via-[#160d12] to-black/80 p-4 shadow-[0_0_30px_-15px_rgba(255,43,43,0.3)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neon/20 pb-3">
        <div className="flex items-center gap-2">
          <Award className="size-4 text-neon" />
          <h4 className="font-display text-sm uppercase tracking-[0.2em] text-stone-100">Council Scorecard</h4>
        </div>
        {avgScore && (
          <div className="flex items-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-xs">
            <span className="text-[10px] uppercase tracking-widest text-stone-400">Average Score</span>
            <span className="font-display text-sm font-semibold text-neon">{avgScore} / 10</span>
          </div>
        )}
      </div>

      {ratings.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ratings.map((r, i) => {
            const styles = getScoreColor(r.score);
            const pct = Math.round((r.score / r.max) * 100);
            return (
              <div
                key={i}
                className="flex flex-col justify-between rounded border border-stone-800/80 bg-black/40 p-3 transition-colors hover:border-neon/30"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium uppercase tracking-wider text-stone-200">
                      {r.category}
                    </span>
                    <span
                      className={`inline-flex items-baseline gap-0.5 rounded px-2 py-0.5 text-xs font-semibold tabular-nums ${styles.text} ${styles.bg} border ${styles.border}`}
                    >
                      {r.score}
                      <span className="text-[10px] font-normal text-stone-500">/{r.max}</span>
                    </span>
                  </div>

                  {/* Meter bar */}
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-900">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${styles.bar} ${styles.shadow} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {r.rationale && (
                  <p className="mt-2.5 line-clamp-2 text-[11px] leading-relaxed text-stone-400">{r.rationale}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Markdown text={markdown || ""} className="text-[13px]" />
      )}
    </div>
  );
}

export function VerdictCard({ report }: { report: DecisionReport }) {
  return (
    <section
      id="verdict"
      aria-labelledby="verdict-title"
      className="neon-border-soft scroll-mt-24 overflow-hidden rounded-md bg-[rgba(10,6,8,0.9)] shadow-[0_0_50px_-20px_rgba(255,43,43,0.6)]"
    >
      <header className="flex flex-col gap-3 border-b border-neon/20 bg-gradient-to-r from-blood/40 to-transparent px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-neon">
            <Scale className="size-3.5" /> The council has ruled
          </div>
          <h3 id="verdict-title" className="font-display mt-1 text-xl text-stone-50">
            Final Verdict
          </h3>
        </div>
        <ExportMenu report={report} />
      </header>

      <div className="flex flex-col gap-4 p-4">
        {/* Council Ratings Scorecard */}
        <RatingScorecard ratings={report.verdict.ratings || []} markdown={report.verdict.ratingsMarkdown} />

        {/* Detailed Sections Grid */}
        <div className="grid gap-3 md:grid-cols-2">
          {SECTIONS.map(({ key, title, icon: Icon }) => (
            <div
              key={key}
              className={`rounded-sm border border-neon/15 bg-black/30 p-3 ${key === "recommendedActions" ? "md:col-span-2" : ""}`}
            >
              <h4 className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-neon">
                <Icon className="size-3.5" />
                {title}
              </h4>
              <Markdown text={report.verdict[key] || "_The council recorded nothing here._"} className="text-[13px]" />
            </div>
          ))}

          {/* Final Summary Card */}
          <div className="rounded-sm border border-neon/30 bg-gradient-to-br from-blood/40 to-black/40 p-4 md:col-span-2">
            <h4 className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-stone-100">
              <Eye className="size-3.5 text-neon" />
              Final Summary
            </h4>
            <Markdown text={report.verdict.finalSummary || "_No summary was recorded._"} className="text-sm text-stone-200" />
          </div>
        </div>
      </div>
    </section>
  );
}


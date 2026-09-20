import type { AgentName } from "./agents";

export interface RatingItem {
  category: string;
  score: number;
  max: number;
  rationale: string;
}

export interface VerdictSections {
  ratings: RatingItem[];
  ratingsMarkdown: string;
  opportunities: string;
  risks: string;
  blindSpots: string;
  missingInformation: string;
  recommendedActions: string;
  finalSummary: string;
}

export interface DecisionReport {
  decisionText: string;
  createdAt: string;
  responses: { agent: AgentName; role: string; text: string }[];
  verdictMarkdown: string;
  verdict: VerdictSections;
}

/** Heading label -> section key. Matching is fuzzy so minor wording drift still parses. */
const SECTION_MATCHERS: [RegExp, keyof Omit<VerdictSections, "ratings">][] = [
  [/rating|score/i, "ratingsMarkdown"],
  [/opportunit/i, "opportunities"],
  [/risk/i, "risks"],
  [/blind/i, "blindSpots"],
  [/missing|information|unknown/i, "missingInformation"],
  [/recommend|action/i, "recommendedActions"],
  [/summary|verdict|conclusion/i, "finalSummary"],
];

export const EMPTY_VERDICT: VerdictSections = {
  ratings: [],
  ratingsMarkdown: "",
  opportunities: "",
  risks: "",
  blindSpots: "",
  missingInformation: "",
  recommendedActions: "",
  finalSummary: "",
};

/**
 * Extracts structured ratings from text (e.g., "- **Market Opportunity:** 8/10 - Rationale").
 */
export function parseRatings(text: string): RatingItem[] {
  const items: RatingItem[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Strip leading list symbols: "- ", "* ", "1. ", "• "
    const cleaned = trimmed.replace(/^[-*•\d.]+\s*/, "").trim();
    // Match patterns like:
    // **Market Opportunity:** 8/10 - Rationale
    // **Market Opportunity**: 8/10 - Rationale
    // Market Opportunity: 8/10
    // **Market Opportunity** - 8/10 (Rationale)
    const m =
      cleaned.match(/^(?:\*\*)?([^*:\n]+?)(?:\*\*)?\s*:?\s*(?:\*\*)?\s*:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)(?:\s*[-–—:(]\s*(.*?)\)?)?$/i) ||
      cleaned.match(/^(?:\*\*)?([^*:\n-]+?)(?:\*\*)?\s*[-–—:]\s*(?:\*\*)?\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)(?:\s*[-–—:(]\s*(.*?)\)?)?$/i);

    if (m) {
      const category = m[1].replace(/^\*+|\*+|:+$/g, "").trim();
      const score = Math.min(10, Math.max(0, parseFloat(m[2])));
      const max = parseInt(m[3], 10) || 10;
      const rationale = (m[4] || "").replace(/^\*+|\*+$/g, "").trim();
      if (category && !isNaN(score)) {
        items.push({ category, score, max, rationale });
      }
    }
  }
  return items;
}

/**
 * Splits Eleven's markdown into verdict sections and structured ratings.
 * Tolerates missing or reordered headings; unmatched text is appended to the summary.
 */
export function parseVerdict(markdown: string): VerdictSections {
  const out: VerdictSections = {
    ratings: [],
    ratingsMarkdown: "",
    opportunities: "",
    risks: "",
    blindSpots: "",
    missingInformation: "",
    recommendedActions: "",
    finalSummary: "",
  };

  const parts = markdown.split(/^\s{0,3}#{1,3}\s+/m);
  // parts[0] is anything before the first heading (should be empty).
  const preamble = parts[0]?.trim();
  for (const part of parts.slice(1)) {
    const newline = part.indexOf("\n");
    const heading = (newline === -1 ? part : part.slice(0, newline)).trim();
    const body = (newline === -1 ? "" : part.slice(newline + 1)).trim();
    const match = SECTION_MATCHERS.find(([re]) => re.test(heading));
    if (match) {
      const key = match[1];
      out[key] = out[key] ? `${out[key]}\n\n${body}` : body;
    } else if (body) {
      out.finalSummary = out.finalSummary ? `${out.finalSummary}\n\n${body}` : body;
    }
  }
  if (preamble && !out.finalSummary) out.finalSummary = preamble;

  // Extract ratings from the ratingsMarkdown section, or fall back to scanning full text
  let extracted = parseRatings(out.ratingsMarkdown);
  if (extracted.length === 0) {
    extracted = parseRatings(markdown);
  }
  out.ratings = extracted;

  return out;
}

export function reportToMarkdown(report: DecisionReport): string {
  const date = new Date(report.createdAt);
  const ratingLines: string[] = [];
  if (report.verdict.ratings && report.verdict.ratings.length > 0) {
    ratingLines.push("### Council Ratings", "");
    for (const r of report.verdict.ratings) {
      ratingLines.push(`- **${r.category}:** ${r.score}/${r.max}${r.rationale ? ` - ${r.rationale}` : ""}`);
    }
    ratingLines.push("");
  } else if (report.verdict.ratingsMarkdown) {
    ratingLines.push("### Council Ratings", "", report.verdict.ratingsMarkdown, "");
  }

  const lines: string[] = [
    "# Founder Arena: Decision Report",
    "",
    `_Generated ${date.toLocaleString()}_`,
    "",
    "## The Decision",
    "",
    report.decisionText.trim(),
    "",
    "---",
    "",
    "## Final Verdict",
    "",
    ...ratingLines,
    "### Key Opportunities",
    "",
    report.verdict.opportunities || "_None recorded._",
    "",
    "### Key Risks",
    "",
    report.verdict.risks || "_None recorded._",
    "",
    "### Blind Spots",
    "",
    report.verdict.blindSpots || "_None recorded._",
    "",
    "### Missing Information",
    "",
    report.verdict.missingInformation || "_None recorded._",
    "",
    "### Recommended Actions",
    "",
    report.verdict.recommendedActions || "_None recorded._",
    "",
    "### Final Summary",
    "",
    report.verdict.finalSummary || "_None recorded._",
    "",
    "---",
    "",
    "## Council Testimony",
    "",
  ];
  for (const r of report.responses) {
    lines.push(`### ${r.agent}, ${r.role}`, "", r.text.trim(), "");
  }
  lines.push("---", "", "_Founder Arena. Put your decisions on trial._");
  return lines.join("\n");
}

/** Strips markdown syntax for plain-text surfaces such as PDF. */
export function markdownToPlain(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*(\d+)\.\s+/gm, "$1. ")
    .replace(/^---$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

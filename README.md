# Founders Arena: The Dungeon

**Ideas go in. Founders come out.**

An AI decision trial system. You bring a startup decision into the Dungeon; a council of six AI characters cross-examines it one at a time, then the judge delivers a structured verdict with a scorecard that you can export as Markdown or PDF.

Built with Next.js 15, React 19, TypeScript, Tailwind CSS v4, Framer Motion and the Anthropic Claude API (Claude Fable 5.1). Web based, no database, nothing is stored.

---

## Table of contents

1. [What it does](#what-it-does)
2. [The council](#the-council)
3. [Screens](#screens)
4. [Quick start](#quick-start)
5. [Configuration](#configuration)
6. [How it works](#how-it-works)
7. [Project structure](#project-structure)
8. [Character portraits](#character-portraits)
9. [Background music](#background-music)
10. [Export](#export)
11. [Mock mode](#mock-mode)
12. [Optional database](#optional-database)
13. [Scripts](#scripts)
14. [Troubleshooting](#troubleshooting)

---

## What it does

1. You land on the neon "Dungeon" page and click **Enter the Dungeon**.
2. In the `# General` chat room you type a decision, for example *"Should I charge ₹10,000 or ₹15,000?"* and press Enter.
3. "The Council Has Been Summoned" plays and the six members speak in order, streaming live into the chat.
4. Eleven, the judge, reads all five testimonies and streams a verdict.
5. The verdict renders as a card with a Council Scorecard, six sections and export buttons.

This is not a chatbot. Every decision is put on trial.

## The council

| Order | Member | Role | What they attack |
| --- | --- | --- | --- |
| 1 | **Steve** | Business Strategist | Revenue, pricing, growth, market opportunity |
| 2 | **Hopper** | Risk Officer | Failure points, operations, resource constraints |
| 3 | **Dustin** | Technical Architect | Engineering effort, technical risk, infrastructure |
| 4 | **Max** | Critical Thinker | Weak logic, hidden assumptions, blind spots |
| 5 | **Vecna** | Devil's Advocate | Fatal flaws, worst cases. Ruthless but logical |
| 6 | **Eleven** | Final Judge | Synthesizes everything into the verdict |

Prompts for each member live in [`src/lib/agents.ts`](src/lib/agents.ts).

### The verdict

Eleven always writes seven sections:

- **Council Ratings**: five scores out of 10 (Market Opportunity, Customer Demand, Execution Feasibility, Risk Resilience, Overall Viability), rendered as a scorecard with meters
- **Key Opportunities**
- **Key Risks**
- **Blind Spots**
- **Missing Information**
- **Recommended Actions**: specific, sequenced, doable within weeks
- **Final Summary**

## Screens

### Landing (`/`)

Neon outlined **DUNGEON** title over an original red-sky scene: treeline silhouette, distant water tower and an inverted reflection with tendrils. All drawn with CSS and inline SVG, no image assets. Nav links: **Dungeon**, **Missions** (how a trial works), **About** (the council). A "Web based · No database · Nothing is stored" line sits under the hero.

### The Dungeon (`/arena`)

A chat room in three columns:

- **Left sidebar**: the `General` channel, one channel per council member (click to see only their testimony), and **Archives** listing the trials from this browser session.
- **Center**: the `# General` feed. Your messages are right-aligned; council messages carry a portrait, an `AI` badge, a timestamp and role. Eleven's verdict renders as a card. The composer sends on Enter (Shift+Enter for a new line) and shows a **Dismiss** button while the council is speaking.
- **Right panel**: Current Mission with a progress bar (members done out of 6), a Vecna quote, and **Active in Dungeon** with live status per member: Online, Speaking, Done.

On phones the sidebar collapses to a chip row above the chat and the right panel hides.

## Quick start

```bash
git clone https://github.com/roshankamat/dungeonAI.git
cd dungeonAI
npm install
cp .env.example .env.local        # then paste your ANTHROPIC_API_KEY
node scripts/check-key.mjs        # optional: verifies the key with one tiny request
npm run dev
```

Open http://localhost:3000 and click **Enter the Dungeon**.

If `npm install` fails with an `EACCES` error on the npm cache, use a temporary cache:

```bash
npm install --cache /tmp/npm-cache
```

## Configuration

All settings are environment variables in `.env.local` (git-ignored). See [`.env.example`](.env.example).

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | Claude API key from https://console.anthropic.com/ |
| `MOCK_COUNCIL` | no | `1` streams a canned council with no API key. Leave empty for the real council |
| `COUNCIL_MODEL` | no | Model for the five advisors. Default `claude-fable-5-1` |
| `JUDGE_MODEL` | no | Model for Eleven. Defaults to `COUNCIL_MODEL` |
| `SUPABASE_URL` | no | Enables optional persistence when set with a key |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Server-side key used only by the API route |

## How it works

### Request flow

```
browser ──POST /api/analyze {decision_text}──▶ Next.js route
                                                │
                       ┌────────────────────────┼────────────────────────┐
                       ▼            ▼           ▼            ▼           ▼
                     Steve       Hopper      Dustin        Max        Vecna      (all five start at once)
                       └────────────────────────┼────────────────────────┘
                                                ▼
                                             Eleven      (reads all five, writes the verdict)
                                                │
browser ◀──── newline-delimited JSON events, streamed ────┘
```

- The five advisors are started **concurrently** so the first words arrive in about 2 to 3 seconds, but their testimony is replayed to the browser **strictly in council order**, one speaker at a time. Later speakers are buffered until it is their turn.
- Eleven receives the decision plus all five testimonies and streams Markdown with fixed headings. The server parses the headings into sections and the ratings into a scorecard, then sends a `verdict` event.
- The whole trial is one HTTP response. No websocket, no polling.

### Event stream

```
{"type":"session","decisionId":null,"persisted":false}
{"type":"agent_start","agent":"Steve"}
{"type":"delta","agent":"Steve","text":"..."}          (many)
{"type":"agent_done","agent":"Steve","text":"..."}
...
{"type":"agent_start","agent":"Eleven"}
{"type":"agent_done","agent":"Eleven","text":"..."}
{"type":"verdict","markdown":"...","sections":{...}}
{"type":"done"}
```

`agent_error` replaces `agent_done` when one member fails; the trial continues. If every advisor fails, or Eleven cannot rule, the stream ends with an `error` event and the UI offers **Retry**.

### Claude API usage

- Model: `claude-fable-5-1` with adaptive thinking (always on for this model).
- Advisors run at `effort: "low"` for speed; Eleven at `effort: "high"` for judgement quality.
- Each system prompt carries a prompt-cache breakpoint so repeated trials reuse the prefix.
- The server-side refusal fallback chain (`fallbacks: "default"`) is enabled on Fable and Opus 5 models.
- Streaming everywhere via the SDK's `.stream()` helper.

Typical real trial: first words in ~2.5 s, all advisors done in ~17 s, verdict in ~75 s, cost roughly one US dollar.

### Frontend state

[`src/hooks/useCouncil.ts`](src/hooks/useCouncil.ts) owns the trial: it POSTs to the API, parses the NDJSON stream line by line, and keeps per-member status (`waiting`, `speaking`, `done`, `error`), text and timestamps. [`src/components/Arena.tsx`](src/components/Arena.tsx) turns that into chat messages and archives completed reports for the session.

## Project structure

```
src/
  app/
    page.tsx                  landing page
    arena/page.tsx            the Dungeon (chat)
    layout.tsx                fonts, global music player
    globals.css               theme tokens, neon utilities, animations
    api/analyze/route.ts      streaming council endpoint
    api/characters/route.ts   lists portraits present in public/characters
  components/
    SceneBackground.tsx       red sky, treeline, water tower, reflection (CSS + SVG)
    NeonTitle.tsx             neon outlined title and wordmark
    TopNav.tsx                Dungeon / Missions / About
    SummonOverlay.tsx         "The Council Has Been Summoned"
    AgentAvatar.tsx           portrait with rune fallback
    MusicPlayer.tsx           looping YouTube player
    Markdown.tsx              small dependency-free Markdown renderer
    ExportMenu.tsx            copy / .md / PDF
    chat/                     Sidebar, ChatPanel, MessageBubble, Composer, VerdictCard, MissionPanel
  hooks/
    useCouncil.ts             trial state + stream parsing
    useCharacterArt.ts        fetches available portraits once
  lib/
    agents.ts                 council definitions and prompts
    report.ts                 verdict + ratings parsing, Markdown report
    anthropic.ts              server-side Claude client and model config
    mock.ts                   canned council for MOCK_COUNCIL=1
    supabase.ts               optional persistence
    events.ts                 wire protocol types
public/characters/            portraits (steve, hopper, dustin, max, vecna, eleven)
scripts/check-key.mjs         one-request API key check
supabase/schema.sql           optional tables
```

## Character portraits

Portraits live in [`public/characters/`](public/characters/). The app lists that folder at runtime through `/api/characters`, so adding or replacing an image needs no code change.

Filenames must be lowercase and match the member name. Any of `.png`, `.jpg`, `.jpeg`, `.webp` works:

```
steve.jpg  hopper.jpg  dustin.jpg  max.jpg  vecna.jpg  eleven.webp
```

Square images around 256×256 or larger look best; they are shown cropped in a circle. If a file is missing the UI falls back to a rune glyph.

## Background music

A **Music** button sits bottom-right on every page. It opens a compact player that loops a YouTube track at moderate volume and keeps playing across page navigation because it is mounted in the root layout.

Browsers block audio until the user interacts with the page, so one click is required; the player cannot start by itself. The track ID is `VIDEO_ID` in [`src/components/MusicPlayer.tsx`](src/components/MusicPlayer.tsx).

## Export

From the verdict card:

- **Copy Markdown**: full report to the clipboard
- **Download .md**: same report as a file
- **Download PDF**: generated in the browser with jsPDF

The report contains the decision, the scorecard, all seven verdict sections and every member's testimony. Built in [`src/lib/report.ts`](src/lib/report.ts).

## Mock mode

Set `MOCK_COUNCIL=1` in `.env.local` and restart. The API streams canned testimony and a canned verdict word by word, so you can demo or work on the UI with no API key and no cost. Set it back to empty for the real council.

## Optional database

There is **no database by default**. Decisions live only in the browser session.

If you want to store trials, create a Supabase project, run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor, and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The API route will then insert one row per decision and one per council response. Persistence failures are logged and never interrupt a trial.

## Scripts

```bash
npm run dev                  # start locally on :3000 (use -- -p 3001 for another port)
npm run build                # production build
npm run start                # serve the production build
npm run lint                 # eslint
node scripts/check-key.mjs   # verify ANTHROPIC_API_KEY with one tiny request
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Server is missing ANTHROPIC_API_KEY" | Put the key in `.env.local` and restart `npm run dev`. Env changes need a restart |
| Every page returns 500 with a Next internals error | Stop the dev server, delete the `.next` folder, start again |
| `npm install` fails with EACCES on the npm cache | `npm install --cache /tmp/npm-cache` |
| Portraits show rune glyphs | Check filenames are lowercase and in `public/characters/`, then refresh |
| Music does not start | Click the Music button; browsers require a user gesture |
| The council is slow to start | Fable thinks before speaking; advisors run at low effort for a ~2.5 s first word. Check your network and rate limits |
| Rate limited (429) | Five advisors start at once. Wait a moment and retry, or lower usage tier concurrency |

---

Made for founders who would rather be challenged in the Dungeon than by the market.

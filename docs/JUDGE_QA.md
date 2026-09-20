# Founders Arena: Judge Q&A Prep

Short, honest answers. Say them in your own words.

## The pitch in 20 seconds

"Founders make big decisions alone, with one biased opinion: their own. Founders Arena puts a decision on trial. Six AI council members, each with one job, cross-examine it live, then a judge delivers a structured verdict with a scorecard you can export. It is not a chatbot. It is a decision trial system."

---

## Product

**What problem does this solve?**
Founders decide on pricing, hiring, fundraising and quitting jobs with no structured challenge. Advisors are slow and expensive. ChatGPT agrees with you. We force six opposing perspectives on every decision in about a minute.

**Why six characters instead of one AI?**
One model with one prompt averages its opinions into mush. Separate roles with strict lanes produce sharper, conflicting views: Steve pushes revenue, Hopper flags what breaks, Dustin checks feasibility, Max attacks assumptions, Vecna hunts fatal flaws, Eleven rules. Disagreement is the feature.

**Why the Stranger Things theme?**
Decisions are scary. The dungeon makes the fear part of the experience and makes people remember it. The visuals are original: CSS and SVG, no copied assets. Characters are named as homage.

**Who is the user?**
Early-stage founders, indie hackers, students pitching ideas, and small business owners facing a pricing or hiring call.

**What does the output look like?**
A verdict card: Council Ratings with five scores out of 10, Key Opportunities, Key Risks, Blind Spots, Missing Information, three Recommended Actions, and a Final Summary. Exportable as Markdown or PDF.

**Is this just prompt engineering?**
The prompts matter, but the product is the orchestration: parallel generation replayed in order, a judge that reads all five, a parser that turns free text into a scorecard, streaming UI, exports. That is a system, not a prompt.

---

## Technical

**What is the stack?**
Next.js 15, React 19, TypeScript, Tailwind v4, Framer Motion, Anthropic Claude API using Claude Fable 5.1. Deployed on Vercel. No database.

**How does the council speak in order but fast?**
All five advisors start generating at the same time. The server buffers the later ones and replays them to the browser strictly in council order. The user hears one voice at a time, but total time is close to one response. First words arrive in about 2.5 seconds.

**How does Eleven synthesize?**
After the five finish, Eleven receives the decision plus all five testimonies in one prompt and streams a verdict with fixed headings. The server parses those headings into sections and the ratings into a scorecard.

**How does streaming work?**
One HTTP POST. The server returns newline-delimited JSON events: agent_start, delta, agent_done, verdict, done. The browser parses line by line and updates state. No websockets, no polling.

**Why no database?**
Nothing needs to persist for the core value. Trials live in the browser session, and exports are the record. Supabase is wired in as optional and turns on with two env variables.

**How do you handle failures?**
One failing member does not stop the trial; the UI shows them as silent and the rest continue. If all fail or Eleven cannot rule, the stream ends with an error and a Retry button. Rate limits and bad keys return readable messages.

**Which model and why?**
Claude Fable 5.1. Advisors run at low effort for speed, Eleven at high effort for judgement. System prompts use prompt caching. A server-side fallback chain handles refusals.

**What does a trial cost?**
About one US dollar and roughly 75 seconds end to end.

**How do you prevent hallucinated numbers?**
Prompts require members to say what they would need to know and to reason from stated assumptions. Missing Information is a dedicated section. The verdict is advice, not fact; we position it as challenge, not truth.

**Security?**
The API key lives only on the server in an environment variable. The browser never sees it. Input is capped at 4,000 characters and validated.

**Mobile?**
Yes. The sidebar collapses to a chip row and the mission panel hides. No horizontal overflow, tested at 390 pixels wide.

---

## Business

**How would this make money?**
Free trial count, then a subscription for unlimited trials, saved history, team seats and custom council members. Later: a B2B version for accelerators and incubators to review cohorts.

**Who are competitors?**
Generic chatbots, human advisors, and startup validation tools. Chatbots agree with you; advisors are slow; validation tools score forms. We simulate an adversarial board in one minute.

**What is the moat?**
The council format, the verdict structure, and the data on which decisions founders bring and what verdicts they act on. Over time the council can learn which challenges changed outcomes.

**Biggest risk?**
People may enjoy the show and not act on the verdict. We mitigate with three concrete, dated actions in every verdict and an export they can bring to co-founders.

---

## Demo and roadmap

**Can you demo it live?**
Yes. Type "Should NorthForge charge ₹10,000 or ₹15,000?" and the council convenes. If the network fails, mock mode streams a canned trial.

**What did you build in the hackathon window?**
Everything: landing, chat dungeon, streaming API, six prompts, verdict parser and scorecard, exports, portraits, music, mobile layout, deploy.

**What is next?**
Follow-up questions to individual members, saved trials with accounts, custom councils for your industry, and a shareable verdict link.

**What was the hardest part?**
Making six parallel streams feel like one conversation in order, and getting a free-text verdict to parse reliably into a scorecard.

---

## Curveballs

**Isn't this just Stranger Things fan fiction?**
The theme is a hook. The engine is role-separated adversarial analysis, which works with any names.

**What if the AI is wrong?**
It will be sometimes. The value is the questions it forces, not the answers. Blind Spots and Missing Information exist precisely to admit uncertainty.

**Why should a founder trust six AIs over one mentor?**
They should not replace a mentor. They should walk into the mentor meeting already having survived the dungeon.

**Can I add my own character?**
Yes. A council member is a name, role and prompt in one file. Adding a seventh takes minutes.

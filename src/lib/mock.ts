import type { Agent } from "./agents";

/**
 * Mock council for local demos and UI work without an API key.
 * Enable with MOCK_COUNCIL=1. Text streams word by word to mimic the real thing.
 */
export const mockEnabled = () => process.env.MOCK_COUNCIL === "1";

const ADVISOR_TEXT: Record<string, string> = {
  Steve: `- **Revenue leverage:** ₹15,000 gives 50% more revenue per account, needing fewer closes to hit targets.
- **Positioning:** Higher price signals premium authority and filters out high-churn, low-budget clients.
- **Market room:** Buyers compare you to agencies costing 5x more, not budget freelancers.

My stance: Anchor at ₹15,000 immediately; keep ₹10,000 only as a closed fallback.`,
  Hopper: `- **Conversion friction:** A 50% jump adds approval gates and lengthens the sales cycle by 1-2 weeks.
- **Delivery expectation:** High-ticket buyers demand faster SLAs and white-glove onboarding.
- **Runway risk:** Slower deal velocity can hurt short-term cash flow if pipeline is thin.

My stance: Raise price on new leads only after stress-testing support capacity.`,
  Dustin: `- **Billing setup:** Multi-tier invoices and subscription updates take less than 2 days to deploy.
- **Onboarding workflow:** Need automated welcome sequences to match the higher price expectation.
- **Feature gating:** No new tech stack required—purely packaging and operational changes.

My stance: Technically trivial to execute; build onboarding flows first.`,
  Max: `- **Unproven assumption:** You assume lower price equals faster sales, but lost deals often cite lack of trust.
- **Binary trap:** Why only ₹10k or ₹15k? Consider quarterly commitments with onboarding baked in.
- **Fast test:** Pitch the next 5 qualified leads at ₹15,000 with a bonus consultation.

My stance: Run a 5-prospect test this week before declaring a permanent price.`,
  Vecna: `- **The fatal chain:** You hike to ₹15,000 without sharper proof of ROI, pipeline stalls, and you panic-discount to ₹10,000.
- **Market punishment:** Discounting under pressure ruins price integrity and trains buyers to haggle.

My stance: If you cannot prove 5x ROI in the first call, the ₹15k price will break your close rate.`,
};

const JUDGE_TEXT = `## Council Ratings
- **Market Opportunity:** 8/10 - Strong tailwinds with premium willingness to pay in this segment.
- **Customer Demand:** 7/10 - High urgency for the core outcome, though trust verification is required.
- **Execution Feasibility:** 9/10 - Fast operational rollout requiring no heavy engineering re-architecture.
- **Risk Resilience:** 6/10 - Moderate exposure to sales cycle elongation if value storytelling lags.
- **Overall Viability:** 8/10 - High-conviction move if rolled out as a gated experiment.

## Key Opportunities
- ₹15,000 lifts unit revenue by 50%, letting conversion drop by up to 33% without hurting gross revenue.
- Premium positioning attracts better-fit clients with higher lifetime value and lower support churn.

## Key Risks
- Sales cycles may lengthen as buyers demand senior approvers for higher invoices.
- Panic-discounting when deals stall would permanently undermine pricing credibility.

## Blind Spots
- Assuming deal drop-offs are driven by price rather than missing social proof or onboarding clarity.
- Ignoring payment terms (e.g. quarterly upfront) as an alternative to single-fee changes.

## Missing Information
- Current lead-to-close conversion rate and average sales velocity at ₹10,000.
- Customer feedback from the last 5 lost opportunities regarding objection triggers.

## Recommended Actions
1. Pitch the next 5 new qualified inbound leads at ₹15,000 starting tomorrow.
2. Upgrade the 1-page ROI value summary and onboarding guarantee before sending new quotes.
3. Establish a 4-week tripwire: if close rate falls below 60% of baseline, reassess with data.

## Final Summary
The council strongly favors testing ₹15,000. The business upside is compelling and technical barriers are non-existent, provided your value proposition commands the increase.

Your single next action: quote ₹15,000 to your next 5 sales conversations without apologizing for the price.`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function streamMock(
  agent: Agent,
  onDelta: (delta: string) => void,
  signal: AbortSignal,
): Promise<string> {
  const text = agent.name === "Eleven" ? JUDGE_TEXT : (ADVISOR_TEXT[agent.name] ?? `${agent.name} has nothing to add.`);
  await sleep(agent.name === "Eleven" ? 900 : 400 + Math.random() * 500);
  const words = text.split(/(\s+)/);
  for (const w of words) {
    if (signal.aborted) break;
    onDelta(w);
    if (w.trim()) await sleep(12 + Math.random() * 30);
  }
  return text;
}

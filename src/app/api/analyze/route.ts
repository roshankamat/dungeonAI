import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { COUNCIL, JUDGE, type Agent } from "@/lib/agents";
import { COUNCIL_MODEL, JUDGE_MODEL, getAnthropic, supportsServerFallbacks } from "@/lib/anthropic";
import type { CouncilEvent } from "@/lib/events";
import { mockEnabled, streamMock } from "@/lib/mock";
import { parseVerdict } from "@/lib/report";
import { createDecision, persistenceEnabled, saveResponse } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_DECISION_CHARS = 4000;

/* ------------------------------------------------------------------ */
/* Small async queue so every advisor can generate concurrently while  */
/* the client still hears them one at a time, in council order.        */
/* ------------------------------------------------------------------ */

type AgentChunk =
  | { kind: "delta"; text: string }
  | { kind: "done"; text: string }
  | { kind: "error"; message: string };

class AsyncQueue<T> {
  private items: T[] = [];
  private waiters: ((v: IteratorResult<T>) => void)[] = [];
  private closed = false;

  push(item: T) {
    if (this.closed) return;
    const waiter = this.waiters.shift();
    if (waiter) waiter({ value: item, done: false });
    else this.items.push(item);
  }

  close() {
    this.closed = true;
    for (const w of this.waiters.splice(0)) w({ value: undefined as never, done: true });
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: () => {
        if (this.items.length) return Promise.resolve({ value: this.items.shift() as T, done: false });
        if (this.closed) return Promise.resolve({ value: undefined as never, done: true });
        return new Promise((resolve) => this.waiters.push(resolve));
      },
    };
  }
}

function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return "The council could not be reached: invalid API key.";
  if (err instanceof Anthropic.RateLimitError) return "The council is overwhelmed with petitions. Try again shortly.";
  if (err instanceof Anthropic.APIConnectionError) return "Lost connection to the council chamber.";
  if (err instanceof Anthropic.APIError) return `Council error (${err.status ?? "unknown"}): ${err.message}`;
  if (err instanceof Error) return err.message;
  return "An unknown error interrupted the council.";
}

/**
 * One streaming call. Uses the beta surface so Claude Fable 5.1 / Opus 5 requests
 * carry the server-side refusal fallback chain; other models get the same request
 * without the fallback fields.
 */
function streamCouncilMember(
  model: string,
  agent: Agent,
  userContent: string,
  maxTokens: number,
  effort: "low" | "medium" | "high" | "xhigh" | "max",
  signal: AbortSignal,
) {
  const client = getAnthropic();
  const fallback = supportsServerFallbacks(model)
    ? { betas: ["server-side-fallback-2026-07-01" as const], fallbacks: "default" as const }
    : {};
  return client.beta.messages.stream(
    {
      model,
      max_tokens: maxTokens,
      system: [{ type: "text", text: agent.systemPrompt, cache_control: { type: "ephemeral" } }],
      thinking: { type: "adaptive" },
      output_config: { effort },
      messages: [{ role: "user", content: userContent }],
      ...fallback,
    },
    { signal },
  );
}

/** Streams one advisor's testimony into its queue. Never throws. */
async function runAdvisor(
  agent: Agent,
  decisionText: string,
  queue: AsyncQueue<AgentChunk>,
  signal: AbortSignal,
): Promise<string | null> {
  let full = "";
  try {
    if (mockEnabled()) {
      const text = await streamMock(
        agent,
        (delta) => {
          full += delta;
          queue.push({ kind: "delta", text: delta });
        },
        signal,
      );
      queue.push({ kind: "done", text });
      return text;
    }
    const stream = streamCouncilMember(
      COUNCIL_MODEL,
      agent,
      `The founder has brought this decision before the council:\n\n"""\n${decisionText}\n"""\n\nDeliver your testimony as ${agent.name}.`,
      8192,
      "low",
      signal,
    );
    stream.on("text", (delta) => {
      full += delta;
      queue.push({ kind: "delta", text: delta });
    });
    const message = await stream.finalMessage();
    if (message.stop_reason === "refusal") {
      queue.push({ kind: "error", message: `${agent.name} declined to testify on this matter.` });
      return null;
    }
    if (message.stop_reason === "max_tokens") full += "\n\n_(testimony cut short)_";
    queue.push({ kind: "done", text: full });
    return full;
  } catch (err) {
    if (signal.aborted) return null;
    console.error(`[analyze] ${agent.name} failed:`, err);
    queue.push({ kind: "error", message: describeError(err) });
    return null;
  } finally {
    queue.close();
  }
}

function buildJudgeBrief(decisionText: string, testimony: { agent: Agent; text: string | null }[]): string {
  const sections = testimony.map(({ agent, text }) =>
    `### ${agent.name} (${agent.role})\n\n${text ?? "_This council member was unable to testify._"}`,
  );
  return [
    "The founder has brought this decision before the council:",
    "",
    '"""',
    decisionText,
    '"""',
    "",
    "The council has spoken. Their testimony:",
    "",
    ...sections,
    "",
    "Deliver your final verdict as Eleven.",
  ].join("\n");
}

async function runJudge(
  decisionText: string,
  testimony: { agent: Agent; text: string | null }[],
  onDelta: (delta: string) => void,
  signal: AbortSignal,
): Promise<string | null> {
  let full = "";
  try {
    if (mockEnabled()) {
      return await streamMock(JUDGE, onDelta, signal);
    }
    const stream = streamCouncilMember(JUDGE_MODEL, JUDGE, buildJudgeBrief(decisionText, testimony), 16000, "high", signal);
    stream.on("text", (delta) => {
      full += delta;
      onDelta(delta);
    });
    const message = await stream.finalMessage();
    if (message.stop_reason === "refusal") return null;
    return full;
  } catch (err) {
    if (signal.aborted) return null;
    console.error("[analyze] Eleven failed:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: { decision_text?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }
  const decisionText = typeof body.decision_text === "string" ? body.decision_text.trim() : "";
  if (!decisionText) {
    return Response.json({ error: "decision_text is required." }, { status: 400 });
  }
  if (decisionText.length > MAX_DECISION_CHARS) {
    return Response.json(
      { error: `decision_text must be ${MAX_DECISION_CHARS} characters or fewer.` },
      { status: 400 },
    );
  }
  if (!mockEnabled() && !process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return Response.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart." },
      { status: 500 },
    );
  }

  const encoder = new TextEncoder();
  const signal = req.signal;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let open = true;
      const send = (event: CouncilEvent) => {
        if (!open) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          open = false;
        }
      };

      try {
        const decisionId = await createDecision(decisionText);
        send({ type: "session", decisionId, persisted: persistenceEnabled() });

        // Fire every advisor at once so total latency is roughly one response,
        // but replay them to the client strictly in council order.
        const queues = COUNCIL.map(() => new AsyncQueue<AgentChunk>());
        const runs = COUNCIL.map((agent, i) => runAdvisor(agent, decisionText, queues[i], signal));

        const testimony: { agent: Agent; text: string | null }[] = [];
        for (let i = 0; i < COUNCIL.length; i++) {
          const agent = COUNCIL[i];
          if (signal.aborted) break;
          send({ type: "agent_start", agent: agent.name });
          for await (const chunk of queues[i]) {
            if (chunk.kind === "delta") send({ type: "delta", agent: agent.name, text: chunk.text });
            else if (chunk.kind === "done") send({ type: "agent_done", agent: agent.name, text: chunk.text });
            else send({ type: "agent_error", agent: agent.name, message: chunk.message });
          }
          const text = await runs[i];
          testimony.push({ agent, text });
          if (text) void saveResponse(decisionId, agent.name, text);
        }

        if (signal.aborted) return;

        const spoke = testimony.filter((t) => t.text).length;
        if (spoke === 0) {
          send({ type: "error", message: "No council member could testify. Check the server logs and try again." });
          return;
        }

        send({ type: "agent_start", agent: JUDGE.name });
        const judgeText = await runJudge(
          decisionText,
          testimony,
          (delta) => send({ type: "delta", agent: JUDGE.name, text: delta }),
          signal,
        );
        if (judgeText === null) {
          send({ type: "agent_error", agent: JUDGE.name, message: "Eleven could not deliver a verdict." });
          send({ type: "error", message: "The verdict was interrupted. The council's testimony is still available above." });
          return;
        }
        send({ type: "agent_done", agent: JUDGE.name, text: judgeText });
        void saveResponse(decisionId, JUDGE.name, judgeText);
        send({ type: "verdict", markdown: judgeText, sections: parseVerdict(judgeText) });
        send({ type: "done" });
      } catch (err) {
        console.error("[analyze] fatal:", err);
        send({ type: "error", message: describeError(err) });
      } finally {
        open = false;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

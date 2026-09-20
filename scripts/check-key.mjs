// Verifies the ANTHROPIC_API_KEY in .env.local (or the shell) with one tiny request.
// Usage: node scripts/check-key.mjs
import fs from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

let key = process.env.ANTHROPIC_API_KEY;
if (!key && fs.existsSync(".env.local")) {
  key = /^ANTHROPIC_API_KEY=(\S+)/m.exec(fs.readFileSync(".env.local", "utf8"))?.[1];
}
if (!key) {
  console.log("No ANTHROPIC_API_KEY found in the shell or .env.local");
  process.exit(1);
}

const model = process.env.COUNCIL_MODEL ?? "claude-fable-5-1";
const client = new Anthropic({ apiKey: key, maxRetries: 0 });

try {
  const m = await client.models.retrieve(model);
  console.log(`model ok: ${m.id} (${m.display_name})`);
} catch (e) {
  console.log(`models.retrieve failed: ${e.status ?? ""} ${e.message?.slice(0, 200)}`);
}

try {
  const r = await client.beta.messages.create({
    model,
    max_tokens: 64,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: [{ role: "user", content: "Reply with the single word: ready" }],
  });
  const text = r.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  console.log(`message ok: served by ${r.model}, stop_reason=${r.stop_reason}, text=${JSON.stringify(text)}`);
  console.log(`usage: ${r.usage.input_tokens} in / ${r.usage.output_tokens} out`);
} catch (e) {
  console.log(`message failed: ${e.status ?? ""} ${e.message?.slice(0, 300)}`);
  process.exit(1);
}

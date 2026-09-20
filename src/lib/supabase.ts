import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AgentName } from "./agents";

/**
 * Optional persistence. If Supabase env vars are absent the app still works;
 * decisions and responses are just not stored.
 */
let client: SupabaseClient | null | undefined;

function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

export const persistenceEnabled = () => getSupabase() !== null;

export async function createDecision(decisionText: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const title = decisionText.trim().replace(/\s+/g, " ").slice(0, 120);
  const { data, error } = await sb
    .from("decisions")
    .insert({ title, decision_text: decisionText })
    .select("id")
    .single();
  if (error) {
    console.error("[supabase] createDecision failed:", error.message);
    return null;
  }
  return data.id as string;
}

export async function saveResponse(
  decisionId: string | null,
  agentName: AgentName,
  responseText: string,
): Promise<void> {
  const sb = getSupabase();
  if (!sb || !decisionId) return;
  const { error } = await sb
    .from("responses")
    .insert({ decision_id: decisionId, agent_name: agentName, response_text: responseText });
  if (error) console.error(`[supabase] saveResponse(${agentName}) failed:`, error.message);
}

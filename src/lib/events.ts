import type { AgentName } from "./agents";
import type { VerdictSections } from "./report";

/**
 * Wire protocol between /api/analyze and the client: newline-delimited JSON.
 * One event per line.
 */
export type CouncilEvent =
  | { type: "session"; decisionId: string | null; persisted: boolean }
  | { type: "agent_start"; agent: AgentName }
  | { type: "delta"; agent: AgentName; text: string }
  | { type: "agent_done"; agent: AgentName; text: string }
  | { type: "agent_error"; agent: AgentName; message: string }
  | { type: "verdict"; markdown: string; sections: VerdictSections }
  | { type: "error"; message: string }
  | { type: "done" };

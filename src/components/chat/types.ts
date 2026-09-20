import type { AgentName } from "@/lib/agents";
import type { DecisionReport } from "@/lib/report";
import type { AgentStatus } from "@/hooks/useCouncil";

export type Channel = "general" | AgentName;

export type ChatMessage =
  | { id: string; kind: "intro"; agent: AgentName; text: string; at: number }
  | { id: string; kind: "user"; text: string; at: number }
  | { id: string; kind: "agent"; agent: AgentName; text: string; status: AgentStatus; error?: string; at: number }
  | { id: string; kind: "verdict"; agent: AgentName; report: DecisionReport; at: number };

export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

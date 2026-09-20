"use client";

import { useEffect, useState } from "react";
import type { AgentName } from "@/lib/agents";

type ArtMap = Partial<Record<AgentName, string>>;

let cache: ArtMap | null = null;
let inflight: Promise<ArtMap> | null = null;

function load(): Promise<ArtMap> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/characters")
      .then((r) => (r.ok ? (r.json() as Promise<ArtMap>) : {}))
      .catch(() => ({}))
      .then((m) => {
        cache = m;
        return m;
      });
  }
  return inflight;
}

/** Portrait URLs for council members, fetched once per page load. */
export function useCharacterArt(): ArtMap {
  const [art, setArt] = useState<ArtMap>(cache ?? {});
  useEffect(() => {
    let alive = true;
    void load().then((m) => alive && setArt(m));
    return () => {
      alive = false;
    };
  }, []);
  return art;
}

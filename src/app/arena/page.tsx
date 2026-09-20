import { Suspense } from "react";
import type { Metadata } from "next";
import { Arena } from "@/components/Arena";

export const metadata: Metadata = {
  title: "The Dungeon: Founder Arena",
  description: "Present your decision to the council.",
};

export default function ArenaPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-abyss" />}>
      <Arena />
    </Suspense>
  );
}

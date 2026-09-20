"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NeonWordmark } from "./NeonTitle";
import { cn } from "@/lib/utils";

const LINKS: { label: string; href: string }[] = [
  { label: "Dungeon", href: "/arena" },
  { label: "Missions", href: "/#missions" },
  { label: "About", href: "/#about" },
];

export function TopNav({ className, cta = true }: { className?: string; cta?: boolean }) {
  const pathname = usePathname();
  return (
    <header className={cn("relative z-20 flex items-center justify-between gap-4 px-5 py-4 sm:px-8", className)}>
      <Link href="/" aria-label="Founders Arena home" className="shrink-0">
        <NeonWordmark />
      </Link>

      <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.25em] md:flex">
        {LINKS.map((l) => {
          const active = !l.href.includes("#") && pathname.startsWith(l.href);
          return (
            <Link
              key={l.label}
              href={l.href}
              className={cn(
                "border-b pb-1 transition-colors",
                active
                  ? "border-neon text-neon drop-shadow-[0_0_8px_rgba(255,43,43,0.8)]"
                  : "border-transparent text-stone-300 hover:text-white",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      {cta && (
        <Link
          href="/arena"
          className="neon-border rounded-sm px-5 py-2 text-xs uppercase tracking-[0.25em] text-neon transition hover:bg-neon/10"
        >
          Enter
        </Link>
      )}
    </header>
  );
}

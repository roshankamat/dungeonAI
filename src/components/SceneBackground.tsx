"use client";

import { useMemo } from "react";

/**
 * Original fantasy scene: blood-red sky, treeline silhouette, a lone water tower,
 * and an inverted reflection with creeping tendrils. Pure CSS + inline SVG, no assets.
 */

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function treeline(seed: number, y: number, amp: number, step: number, width = 1600) {
  const rand = seeded(seed);
  let d = `M0 ${y + amp}`;
  for (let x = 0; x <= width; x += step) {
    const h = y - rand() * amp;
    const w = step * (0.35 + rand() * 0.3);
    d += ` L${x} ${y} L${x + w / 2} ${h} L${x + w} ${y}`;
  }
  d += ` L${width} ${y + 400} L0 ${y + 400} Z`;
  return d;
}

export function SceneBackground({
  reflection = true,
  intensity = 1,
  className = "",
}: {
  reflection?: boolean;
  intensity?: number;
  className?: string;
}) {
  const embers = useMemo(() => {
    const rand = seeded(7);
    return Array.from({ length: Math.round(28 * intensity) }, () => ({
      left: rand() * 100,
      size: 1 + rand() * 2.5,
      delay: -rand() * 18,
      duration: 14 + rand() * 12,
      dx: (rand() - 0.5) * 100,
    }));
  }, [intensity]);

  const far = useMemo(() => treeline(3, 560, 90, 26), []);
  const near = useMemo(() => treeline(11, 610, 130, 34), []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
      style={{ background: "#050305" }}
    >
      {/* Sky */}
      <div
        className="absolute inset-x-0 top-0 h-2/3"
        style={{
          background: "linear-gradient(to bottom, #050305 0%, #1b0407 45%, #3a0509 78%, #2a0407 100%)",
          opacity: 0.95,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 62%, rgba(140,12,20,0.8) 0%, rgba(70,6,10,0.55) 30%, rgba(5,3,5,0) 70%)",
        }}
      />
      {/* Rolling fog */}
      <div
        className="absolute h-[30%] animate-fog blur-2xl"
        style={{
          left: "-10%",
          right: "-10%",
          top: "28%",
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(255,43,43,0.16), transparent 60%), radial-gradient(ellipse at 70% 40%, rgba(255,43,43,0.12), transparent 55%)",
        }}
      />

      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="waterGlow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3a0509" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#7a0b12" stopOpacity="0.55" />
            <stop offset="1" stopColor="#050305" stopOpacity="1" />
          </linearGradient>
          <filter id="blur6">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Far and near treelines */}
        <path d={far} fill="#0c0406" opacity="0.9" />
        <path d={near} fill="#050305" />

        {/* Water tower on the right */}
        <g transform="translate(1380 470) scale(0.62)" fill="#050305" stroke="#050305">
          <polygon points="0,0 60,-40 120,0" />
          <rect x="4" y="0" width="112" height="80" rx="6" />
          <rect x="34" y="-8" width="52" height="10" rx="2" />
          <g strokeWidth="6" strokeLinecap="round">
            <line x1="18" y1="80" x2="4" y2="230" />
            <line x1="102" y1="80" x2="116" y2="230" />
            <line x1="44" y1="80" x2="40" y2="230" />
            <line x1="76" y1="80" x2="80" y2="230" />
            <line x1="10" y1="140" x2="110" y2="140" />
            <line x1="6" y1="190" x2="114" y2="190" />
            <line x1="10" y1="140" x2="112" y2="190" />
            <line x1="110" y1="140" x2="8" y2="190" />
          </g>
          {/* Window light */}
          <rect x="52" y="30" width="14" height="10" fill="#ff2b2b" opacity="0.7" filter="url(#blur2)" />
        </g>

        {/* Horizon line glow */}
        <rect x="0" y="606" width="1600" height="3" fill="#ff2b2b" opacity="0.25" filter="url(#blur6)" />

        {reflection && (
          <g>
            {/* Water */}
            <rect x="0" y="608" width="1600" height="292" fill="url(#waterGlow)" />
            {/* Mirrored treeline */}
            <g transform="translate(0 1216) scale(1 -1)" opacity="0.5" filter="url(#blur6)">
              <path d={near} fill="#1a0406" />
            </g>
            {/* Central glow beneath the water */}
            <ellipse cx="800" cy="720" rx="330" ry="120" fill="#a30f19" opacity="0.35" filter="url(#blur6)" />
            {/* Tendrils rising from the deep */}
            <g fill="none" stroke="#2c0406" strokeWidth="7" strokeLinecap="round" opacity="0.9">
              <path d="M800 900 C 780 820, 700 800, 640 760 S 560 700, 520 690" />
              <path d="M820 900 C 860 820, 920 800, 980 770 S 1080 720, 1120 700" />
              <path d="M760 900 C 720 850, 600 860, 520 820 S 380 760, 320 750" />
              <path d="M840 900 C 900 860, 1020 870, 1100 830 S 1240 780, 1300 770" />
              <path d="M790 900 C 800 830, 770 760, 720 720" />
              <path d="M810 900 C 830 830, 880 760, 920 730" />
              <path d="M700 900 C 660 880, 560 900, 480 870 S 300 830, 240 840" />
              <path d="M900 900 C 960 880, 1060 910, 1140 880 S 1320 840, 1380 850" />
            </g>
            <g fill="none" stroke="#4a070c" strokeWidth="3" strokeLinecap="round" opacity="0.7">
              <path d="M640 760 C 600 740, 560 745, 540 720" />
              <path d="M980 770 C 1010 740, 1050 745, 1080 725" />
              <path d="M520 820 C 480 800, 450 810, 420 790" />
              <path d="M1100 830 C 1140 810, 1170 820, 1200 800" />
            </g>
          </g>
        )}
      </svg>

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)" }}
      />

      {/* Embers */}
      {embers.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-0 block rounded-full animate-drift"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              background: "var(--neon)",
              boxShadow: `0 0 ${p.size * 4}px var(--neon)`,
              "--dx": `${p.dx}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

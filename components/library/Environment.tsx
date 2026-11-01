"use client";

import type { ZoneSlug } from "@/lib/zones";

/*
 * The water around each shelf of the library. Pure CSS animation so it costs
 * little; every effect is motion-safe and simply holds still for readers who
 * prefer reduced motion.
 */

const seeded = (n: number, salt = 1) => {
  const x = Math.sin(n * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function Sunlight() {
  return (
    <>
      {/* rippling surface */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#bfe9f5]/35 to-transparent" />
      {/* god rays */}
      {[8, 22, 38, 55, 71, 86].map((l, i) => (
        <div
          key={l}
          className="absolute -top-[10%] h-[120%] origin-top blur-2xl motion-safe:animate-[ray_var(--d)_ease-in-out_infinite]"
          style={{
            left: `${l}%`,
            width: `${6 + (i % 3) * 4}%`,
            rotate: `${10 + i * 2}deg`,
            background: "linear-gradient(180deg, rgba(220,250,255,0.32), transparent 72%)",
            ["--d" as string]: `${9 + i * 2}s`,
          }}
        />
      ))}
      {/* caustics */}
      <div
        className="absolute -inset-[20%] opacity-30 mix-blend-screen motion-safe:animate-[caustic_18s_ease-in-out_infinite]"
        style={{
          background:
            "repeating-radial-gradient(circle at 30% 20%, transparent 0 22px, rgba(220,255,250,0.35) 23px 24px, transparent 25px 52px), repeating-radial-gradient(circle at 70% 60%, transparent 0 30px, rgba(220,255,250,0.25) 31px 32px, transparent 33px 64px)",
        }}
      />
    </>
  );
}

/* Silhouettes in the fading blue: fish, a squid, a jelly. */
const SHAPES = [
  "M0,10 C10,0 30,0 40,10 C30,20 10,20 0,10 Z M40,10 L52,2 L52,18 Z",
  "M0,8 C14,-2 40,0 52,8 C40,16 14,18 0,8 Z M52,8 L60,2 L60,14 Z",
  "M10,0 C24,0 30,10 30,20 L28,46 M14,20 L12,46 M20,20 L20,50 M10,20 C4,10 4,0 10,0",
  "M0,12 C0,0 30,0 30,12 Z M4,12 C4,26 2,34 0,40 M10,12 C10,30 12,36 10,44 M20,12 C20,28 18,38 20,44 M26,12 C26,26 28,34 30,40",
];

function Silhouettes() {
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => {
        const top = 10 + seeded(i) * 75;
        const size = 40 + seeded(i, 2) * 90;
        const dur = 50 + seeded(i, 3) * 60;
        const dir = i % 2 ? 1 : -1;
        return (
          <svg
            key={i}
            viewBox="-4 -4 68 58"
            className="absolute motion-safe:animate-[swim_var(--d)_linear_infinite]"
            style={{
              top: `${top}%`,
              left: dir > 0 ? "-12%" : "104%",
              width: size,
              opacity: 0.12 + seeded(i, 4) * 0.18,
              transform: dir < 0 ? "scaleX(-1)" : undefined,
              ["--d" as string]: `${dur}s`,
              ["--dx" as string]: `${dir * 125}vw`,
              animationDelay: `${-seeded(i, 5) * dur}s`,
              filter: `blur(${seeded(i, 6) * 2}px)`,
            }}
            aria-hidden
          >
            <path d={SHAPES[i % SHAPES.length]} fill={i % 4 > 1 ? "none" : "#020a14"} stroke="#020a14" strokeWidth="2" />
          </svg>
        );
      })}
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#2d6c95]/25 to-transparent" />
    </>
  );
}

/* Living light: points that flare and fade, some blue, some green. */
function Bioluminescence({ count = 46, faint = false }: { count?: number; faint?: boolean }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const color = seeded(i, 7) > 0.7 ? "120,255,190" : "110,200,255";
        const s = 2 + seeded(i, 8) * 4;
        return (
          <span
            key={i}
            className="absolute rounded-full motion-safe:animate-[glow_var(--d)_ease-in-out_infinite]"
            style={{
              left: `${seeded(i, 9) * 100}%`,
              top: `${seeded(i, 10) * 100}%`,
              width: s,
              height: s,
              background: `rgba(${color},${faint ? 0.6 : 0.9})`,
              boxShadow: `0 0 ${s * 4}px ${s}px rgba(${color},${faint ? 0.25 : 0.45})`,
              ["--d" as string]: `${3 + seeded(i, 11) * 6}s`,
              animationDelay: `${-seeded(i, 12) * 8}s`,
              opacity: faint ? 0.35 : 0.6,
            }}
            aria-hidden
          />
        );
      })}
    </>
  );
}

function Snow({ count = 50 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const dur = 22 + seeded(i, 13) * 30;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-ivory/50 motion-safe:animate-[sink_var(--d)_linear_infinite]"
            style={{
              left: `${seeded(i, 14) * 100}%`,
              top: "-2%",
              width: 1 + seeded(i, 15) * 2,
              height: 1 + seeded(i, 15) * 2,
              opacity: 0.15 + seeded(i, 16) * 0.4,
              ["--d" as string]: `${dur}s`,
              animationDelay: `${-seeded(i, 17) * dur}s`,
            }}
            aria-hidden
          />
        );
      })}
    </>
  );
}

function TrenchWalls() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
      <path d="M0,0 L22,0 L18,12 L26,24 L20,38 L30,52 L24,66 L34,80 L30,100 L0,100 Z" fill="#05070a" />
      <path d="M100,0 L80,0 L84,14 L74,28 L82,40 L70,56 L78,70 L66,84 L72,100 L100,100 Z" fill="#05070a" />
      <path d="M22,0 L18,12 L26,24 L20,38 L30,52 L24,66 L34,80 L30,100" fill="none" stroke="rgba(120,160,200,0.08)" strokeWidth="0.3" />
      <path d="M80,0 L84,14 L74,28 L82,40 L70,56 L78,70 L66,84 L72,100" fill="none" stroke="rgba(120,160,200,0.08)" strokeWidth="0.3" />
    </svg>
  );
}

export function Environment({ zone }: { zone: ZoneSlug }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {zone === "surface" && <Sunlight />}
      {zone === "twilight" && (
        <>
          <Silhouettes />
          <Snow count={30} />
        </>
      )}
      {zone === "midnight" && (
        <>
          <Bioluminescence />
          <Snow count={40} />
        </>
      )}
      {zone === "abyssal" && (
        <>
          <Snow count={60} />
          <Bioluminescence count={10} faint />
        </>
      )}
      {zone === "hadal" && (
        <>
          <TrenchWalls />
          <Snow count={18} />
          <Bioluminescence count={4} faint />
        </>
      )}
      <style>{`
        @keyframes ray { 0%,100% { opacity: .35; transform: translateX(0); } 50% { opacity: 1; transform: translateX(2vw); } }
        @keyframes caustic { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(3%,2%) rotate(3deg); } }
        @keyframes swim { from { translate: 0 0; } to { translate: var(--dx) 0; } }
        @keyframes glow { 0%,100% { opacity: .05; } 40% { opacity: .9; } 60% { opacity: .6; } }
        @keyframes sink { from { translate: 0 0; } to { translate: 2vw 110vh; } }
      `}</style>
    </div>
  );
}

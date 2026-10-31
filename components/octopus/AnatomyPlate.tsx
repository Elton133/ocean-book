"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";
import { ARMS, suckerPoints, taperedPath } from "./geometry";

export interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  text: string;
}

/** Natural-history plate of the octopus, drawn in ink, with clickable anatomy. */
export function AnatomyPlate({ hotspots, className = "" }: { hotspots: Hotspot[]; className?: string }) {
  const { active, reduced, delay } = usePageMotion();
  const [selected, setSelected] = useState<string | null>(null);
  const current = hotspots.find((h) => h.id === selected);

  const arms = useMemo(
    () =>
      ARMS.map((c, i) => ({
        d: taperedPath(c, 30, 3),
        suckers: [...suckerPoints(c, 30, 3, 16, 1), ...suckerPoints(c, 30, 3, 15, -0.2, 0.16, 0.9)],
        back: i === 0 || i === 7,
      })),
    [],
  );

  const draw = (i: number, dur = 1.6) => ({
    initial: { pathLength: 0, fillOpacity: 0 },
    animate: active ? { pathLength: 1, fillOpacity: 1 } : { pathLength: 0, fillOpacity: 0 },
    transition: {
      pathLength: { duration: reduced ? 0 : dur, delay: active ? delay + 0.2 + i * 0.08 : 0, ease: EASE_OUT },
      fillOpacity: { duration: reduced ? 0 : 1, delay: active ? delay + 0.9 + i * 0.08 : 0 },
    },
  });

  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto aspect-square w-full max-w-[min(62vh,560px)]">
        <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full" role="img" aria-label="Ink illustration of a giant Pacific octopus seen from the front, with labelled anatomy">
          <defs>
            <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="5" stroke="#15171b" strokeWidth="0.6" strokeOpacity="0.35" />
            </pattern>
          </defs>
          <g stroke="#15171b" strokeWidth="1.1" strokeLinejoin="round">
            {/* arms behind */}
            {arms.map((a, i) =>
              a.back ? (
                <motion.path key={i} d={a.d} fill="#e2d6c0" {...draw(i)} />
              ) : null,
            )}
            {/* web */}
            <motion.path
              d="M228,300 Q205,350 238,330 Q245,372 262,346 Q278,382 290,352 Q300,390 310,352 Q322,382 338,346 Q355,372 362,330 Q395,350 372,300 Z"
              fill="url(#hatch)"
              {...draw(2, 1.2)}
            />
            {arms.map((a, i) =>
              a.back ? null : <motion.path key={i} d={a.d} fill="#ebe1cd" {...draw(i)} />,
            )}
            {/* suckers */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 1.2, delay: active ? delay + 1.5 : 0 }}
              fill="#f5efe3"
              strokeWidth="0.7"
            >
              {arms.flatMap((a, i) => a.suckers.map((s, j) => <circle key={`${i}-${j}`} cx={s.x} cy={s.y} r={s.r} />))}
            </motion.g>
            {/* head and mantle */}
            <motion.path
              d="M300,18 C380,18 410,90 405,160 C401,215 380,238 372,262 C368,292 340,312 300,312 C260,312 232,292 228,262 C220,238 199,215 195,160 C190,90 220,18 300,18 Z"
              fill="#efe6d4"
              {...draw(0, 2)}
            />
            <motion.path
              d="M230,120 C240,80 265,52 300,46 M370,120 C362,92 345,70 322,58 M250,180 C270,200 330,200 350,180"
              fill="none"
              strokeOpacity="0.4"
              {...draw(1, 2)}
            />
            {/* eyes */}
            {[246, 354].map((cx, i) => (
              <motion.g key={cx} {...draw(3 + i, 1)}>
                <motion.circle cx={cx} cy="246" r="17" fill="#f5efe3" />
                <rect x={cx - 9} y="243" width="18" height="6" rx="3" fill="#15171b" />
              </motion.g>
            ))}
            {/* siphon */}
            <motion.path d="M352,272 C372,268 384,282 380,296 C376,304 366,302 362,294 C358,286 350,284 346,282 Z" fill="#e6dac4" {...draw(5, 1)} />
            {/* beak, hidden beneath */}
            <motion.circle cx="300" cy="396" r="13" fill="none" strokeDasharray="3 3" strokeOpacity="0.7" {...draw(6, 1)} />
          </g>
        </svg>

        {/* Hotspots */}
        {hotspots.map((h, i) => (
          <motion.button
            key={h.id}
            type="button"
            data-no-drag
            onClick={() => setSelected(selected === h.id ? null : h.id)}
            aria-pressed={selected === h.id}
            aria-label={`${h.label}: show details`}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.6, delay: active ? delay + 2 + i * 0.09 : 0, ease: EASE_OUT }}
          >
            <span className="relative grid h-7 w-7 place-items-center">
              {!reduced && <span className="absolute inset-0 animate-ping rounded-full border border-coral/70 [animation-duration:2.4s]" />}
              <span
                className={`relative h-3 w-3 rounded-full border border-ink transition ${selected === h.id ? "scale-125 bg-coral" : "bg-ivory group-hover:bg-coral"}`}
              />
            </span>
            <span className="annot pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap bg-ivory/80 px-1 uppercase tracking-[0.15em] text-ink">
              {h.label}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="relative mx-auto mt-3 min-h-[5.5rem] max-w-md">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="border-l border-coral pl-4"
            >
              <p className="display text-2xl italic">{current.label}</p>
              <p className="mt-1 text-sm leading-relaxed opacity-80">{current.text}</p>
            </motion.div>
          ) : (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }} className="annot pt-2 text-center">
              Fig. 1 — Select a marker to explore the anatomy
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

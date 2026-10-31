"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";
import { bez, bezPath, type Bezier } from "./geometry";

const C = 250;

/** Eight arm nerve cords radiating from the central brain (viewBox 500×500). */
const CORDS: Bezier[] = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2 + Math.PI / 8;
  const bend = (i % 2 ? 1 : -1) * 0.35;
  const p = (r: number, da = 0): [number, number] => [C + Math.cos(a + da) * r, C + Math.sin(a + da) * r];
  return [p(46), p(110, bend * 0.4), p(170, -bend), p(232, bend * 0.6)];
});

type Event = { kind: "brain"; id: number } | { kind: "arm"; arm: number; id: number } | null;

export function NervousSystem({ className = "" }: { className?: string }) {
  const { active, reduced, delay } = usePageMotion();
  const [event, setEvent] = useState<Event>(null);

  const ganglia = useMemo(
    () => CORDS.map((c) => Array.from({ length: 11 }, (_, j) => bez(c, 0.12 + (j / 10) * 0.88))),
    [],
  );

  const fireBrain = () => setEvent((e) => ({ kind: "brain", id: (e?.id ?? 0) + 1 }));
  const touchArm = (arm: number) => setEvent((e) => ({ kind: "arm", arm, id: (e?.id ?? 0) + 1 }));

  const caption =
    event?.kind === "brain"
      ? "A command from the brain travels out along all eight nerve cords."
      : event?.kind === "arm"
        ? "Touched: the arm's own nerve cord coordinates a local response along its length, while signals also travel to the brain."
        : "Tap an arm to touch it, or send a command from the brain.";

  return (
    <div className={className}>
      <div className="relative mx-auto aspect-square w-full max-w-[min(54vh,480px)]">
        <svg viewBox="0 0 500 500" className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label="Diagram of the octopus nervous system: a ring-shaped brain with eight nerve cords running down the arms, each with a chain of ganglia.">
          <defs>
            <radialGradient id="ns-glow">
              <stop offset="0%" stopColor="var(--biolume)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--biolume)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* cords */}
          {CORDS.map((c, i) => (
            <g key={i}>
              <motion.path
                d={bezPath(c)}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.45"
                strokeWidth="1.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: active ? 1 : 0 }}
                transition={{ duration: reduced ? 0 : 1.6, delay: active ? delay + 0.3 + i * 0.07 : 0, ease: EASE_OUT }}
              />
              {/* wide invisible hit area for touch */}
              <path
                d={bezPath(c)}
                fill="none"
                stroke="transparent"
                strokeWidth="34"
                className="cursor-pointer"
                data-no-drag
                onClick={() => touchArm(i)}
                role="button"
                aria-label={`Touch arm ${i + 1}`}
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), touchArm(i))}
              />
              {ganglia[i].map(([x, y], j) => (
                <motion.circle
                  key={j}
                  cx={x}
                  cy={y}
                  r={2.6 - j * 0.12}
                  fill="currentColor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: active ? 0.7 : 0 }}
                  transition={{ duration: 0.4, delay: active ? delay + 1 + i * 0.05 + j * 0.03 : 0 }}
                  className="pointer-events-none"
                />
              ))}
            </g>
          ))}

          {/* brain: ring around the oesophagus, flanked by optic lobes */}
          <motion.g
            initial={{ scale: 0.6, opacity: 0 }}
            animate={active ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
            transition={{ duration: 1.2, delay: active ? delay + 0.1 : 0, ease: EASE_OUT }}
            style={{ transformOrigin: "250px 250px" }}
          >
            <ellipse cx={C - 60} cy={C} rx="22" ry="34" fill="none" stroke="currentColor" strokeOpacity="0.6" />
            <ellipse cx={C + 60} cy={C} rx="22" ry="34" fill="none" stroke="currentColor" strokeOpacity="0.6" />
            <circle cx={C} cy={C} r="38" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.8" />
            <circle cx={C} cy={C} r="12" fill="var(--abyss)" stroke="currentColor" strokeOpacity="0.6" />
          </motion.g>

          {/* pulses */}
          <AnimatePresence>
            {event?.kind === "brain" &&
              CORDS.map((c, i) => {
                const pts = Array.from({ length: 20 }, (_, k) => bez(c, k / 19));
                return (
                  <motion.circle
                    key={`${event.id}-${i}`}
                    r="9"
                    fill="url(#ns-glow)"
                    initial={{ cx: pts[0][0], cy: pts[0][1], opacity: 1 }}
                    animate={{ cx: pts.map((p) => p[0]), cy: pts.map((p) => p[1]), opacity: [1, 1, 0] }}
                    transition={{ duration: reduced ? 0.01 : 1.4, ease: "easeOut" }}
                    exit={{ opacity: 0 }}
                  />
                );
              })}
            {event?.kind === "arm" && (
              <g key={event.id}>
                {ganglia[event.arm].map(([x, y], j) => (
                  <motion.circle
                    key={j}
                    cx={x}
                    cy={y}
                    r="7"
                    fill="url(#ns-glow)"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: [0, 1, 0.15], scale: [0.4, 1.4, 1] }}
                    transition={{ duration: 0.9, delay: Math.abs(j - 8) * 0.07 }}
                  />
                ))}
                {(() => {
                  const c = CORDS[event.arm];
                  const pts = Array.from({ length: 16 }, (_, k) => bez(c, 0.8 - (k / 15) * 0.8));
                  return (
                    <motion.circle
                      r="6"
                      fill="url(#ns-glow)"
                      initial={{ cx: pts[0][0], cy: pts[0][1], opacity: 0 }}
                      animate={{ cx: pts.map((p) => p[0]), cy: pts.map((p) => p[1]), opacity: [0, 0.8, 0.8, 0] }}
                      transition={{ duration: 1.3, delay: 0.5, ease: "easeInOut" }}
                    />
                  );
                })()}
              </g>
            )}
          </AnimatePresence>

          <text x={C} y={C + 62} textAnchor="middle" fontSize="9" className="annot" fill="currentColor" opacity="0.6">
            BRAIN
          </text>
          <text x={C - 60} y={C - 42} textAnchor="middle" fontSize="8" className="annot" fill="currentColor" opacity="0.45">
            OPTIC LOBE
          </text>
        </svg>
      </div>

      <div className="mx-auto mt-2 flex max-w-md flex-col items-center gap-3" data-no-drag>
        <button
          type="button"
          onClick={fireBrain}
          className="annot border border-biolume/60 px-4 py-2 uppercase tracking-[0.18em] text-biolume transition hover:bg-biolume hover:text-abyss"
        >
          Send a command from the brain
        </button>
        <p className="min-h-[2.75rem] text-center text-sm italic opacity-75" aria-live="polite">
          {caption}
        </p>
      </div>
    </div>
  );
}

/** About 500 million neurons, about two-thirds of them in the arms (Octopus vulgaris). */
export function NeuronSplit({ className = "" }: { className?: string }) {
  const { active, delay } = usePageMotion();
  const dots = Array.from({ length: 30 }, (_, i) => i);
  return (
    <figure className={className}>
      <div className="grid grid-cols-10 gap-1.5" aria-hidden>
        {dots.map((i) => (
          <motion.span
            key={i}
            className={`aspect-square rounded-full ${i < 20 ? "bg-biolume" : "border border-ivory/60"}`}
            initial={{ scale: 0 }}
            animate={{ scale: active ? 1 : 0 }}
            transition={{ duration: 0.4, delay: active ? delay + 0.8 + i * 0.025 : 0, ease: EASE_OUT }}
          />
        ))}
      </div>
      <figcaption className="annot mt-3 flex justify-between gap-4 opacity-70">
        <span>
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-biolume align-middle" />≈ ⅔ in the arms
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full border border-ivory/60 align-middle" />≈ ⅓ brain &amp; optic lobes
        </span>
      </figcaption>
    </figure>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE_CINE, EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";
import { Ref } from "@/components/media/Media";

export interface Stage {
  label: string;
  detail: string;
  ref?: number;
}

/** A life cycle as a ring that plays like a timeline; tap any stage to scrub. */
export function LifeCycle({ stages, className = "" }: { stages: Stage[]; className?: string }) {
  const { active, reduced, delay } = usePageMotion();
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!active || !auto || reduced) return;
    const id = setInterval(() => setI((v) => (v + 1) % stages.length), 5200);
    return () => clearInterval(id);
  }, [active, auto, reduced, stages.length]);

  const R = 160;
  const C = 200;
  const circ = 2 * Math.PI * R;
  const pos = (k: number) => {
    const a = (k / stages.length) * Math.PI * 2 - Math.PI / 2;
    return [C + Math.cos(a) * R, C + Math.sin(a) * R];
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto aspect-square w-full max-w-[min(56vh,460px)]">
        <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full overflow-visible">
          <circle cx={C} cy={C} r={R} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          <motion.circle
            cx={C}
            cy={C}
            r={R}
            fill="none"
            stroke="var(--biolume)"
            strokeWidth="1.5"
            strokeDasharray={circ}
            transform={`rotate(-90 ${C} ${C})`}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: active ? circ - (circ * (i + 1)) / stages.length + 1 : circ }}
            transition={{ duration: reduced ? 0 : 1.4, ease: EASE_CINE }}
          />
        </svg>
        {stages.map((s, k) => {
          const [x, y] = pos(k);
          const on = k === i;
          return (
            <motion.button
              key={s.label}
              type="button"
              data-no-drag
              onClick={() => {
                setI(k);
                setAuto(false);
              }}
              aria-pressed={on}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(x / 400) * 100}%`, top: `${(y / 400) * 100}%` }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.7, delay: active ? delay + 0.5 + k * 0.1 : 0, ease: EASE_OUT }}
            >
              <span className={`block h-3 w-3 rounded-full border transition-all duration-500 ${on ? "scale-150 border-biolume bg-biolume" : k < i ? "border-biolume bg-biolume/40" : "border-ivory/60 bg-abyss group-hover:border-ivory"}`} />
              <span className={`annot absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap uppercase tracking-[0.16em] transition ${on ? "opacity-100" : "opacity-50"}`}>
                {s.label}
              </span>
            </motion.button>
          );
        })}
        <div className="absolute inset-[22%] grid place-items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
            >
              <p className="annot opacity-50">{String(i + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}</p>
              <p className="display mt-1 text-3xl italic sm:text-4xl">{stages[i].label}</p>
              <p className="mt-2 text-[0.8rem] leading-relaxed opacity-80 sm:text-sm">
                {stages[i].detail}
                <Ref n={stages[i].ref} />
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

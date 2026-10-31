"use client";

import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";

/* Approximate positions around the North Pacific rim, east to west (schematic). */
const PLACES: [number, number][] = [
  [520, 330],
  [515, 262],
  [480, 172],
  [420, 104],
  [320, 74],
  [205, 98],
  [150, 210],
  [104, 254],
];

function smooth(points: [number, number][]) {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function RangeArc({ places, className = "" }: { places: string[]; className?: string }) {
  const { active, reduced, delay } = usePageMotion();
  const d = smooth(PLACES);
  return (
    <figure className={className}>
      <svg viewBox="40 30 540 340" className="h-auto w-full overflow-visible" role="img" aria-label={`Range around the North Pacific rim: ${places.join(", ")}.`}>
        {[110, 170, 230, 290].map((y) => (
          <line key={y} x1="40" x2="580" y1={y} y2={y} stroke="currentColor" strokeOpacity="0.07" />
        ))}
        <text x="318" y="230" textAnchor="middle" className="display" fontStyle="italic" fontSize="30" fill="currentColor" opacity="0.22">
          North Pacific
        </text>
        <motion.path
          d={d}
          fill="none"
          stroke="var(--biolume)"
          strokeOpacity="0.25"
          strokeWidth="26"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: active ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 2.6, delay: active ? delay + 0.3 : 0, ease: EASE_OUT }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke="var(--biolume)"
          strokeWidth="1.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: active ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 2.6, delay: active ? delay + 0.3 : 0, ease: EASE_OUT }}
        />
        {PLACES.map(([x, y], i) => {
          const right = i <= 3;
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: 0.6, delay: active ? delay + 0.5 + i * 0.28 : 0 }}
            >
              <circle cx={x} cy={y} r="3.5" fill="var(--biolume)" />
              <text
                x={right ? x + 12 : x - 12}
                y={y + 4}
                textAnchor={right ? "start" : "end"}
                className="annot"
                fontSize="11"
                fill="currentColor"
                opacity="0.8"
              >
                {places[i]}
              </text>
            </motion.g>
          );
        })}
      </svg>
      <figcaption className="annot mt-1 opacity-50">Schematic of the coastal range — not to scale.</figcaption>
    </figure>
  );
}

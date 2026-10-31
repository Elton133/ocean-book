"use client";

import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";

const ZONES = [
  { name: "Sunlight zone", from: 0, to: 200, tint: "rgba(111,214,200,0.20)" },
  { name: "Twilight zone", from: 200, to: 1000, tint: "rgba(60,110,150,0.16)" },
  { name: "Midnight zone", from: 1000, to: 4000, tint: "rgba(20,40,70,0.22)" },
  { name: "Abyssal zone", from: 4000, to: 6000, tint: "rgba(5,10,20,0.4)" },
  { name: "Hadal zone", from: 6000, to: 11000, tint: "rgba(0,0,0,0.5)" },
];

/**
 * Vertical ocean section with the animal's typical depth band.
 * Uses a square-root scale so the busy upper ocean stays legible.
 */
export function DepthGauge({
  min,
  max,
  label,
  approx,
  className = "",
  height = 420,
}: {
  min: number;
  max: number;
  label: string;
  approx?: boolean;
  className?: string;
  height?: number;
}) {
  const { active, reduced, delay } = usePageMotion();
  const floor = max > 4000 ? 11000 : max > 1500 ? 6000 : 4000;
  const scale = (m: number) => (Math.sqrt(Math.min(m, floor)) / Math.sqrt(floor)) * height;
  const zones = ZONES.filter((z) => z.from < floor);
  const ticks = [0, 200, 1000, 2000, 4000, 6000, 11000].filter((t) => t <= floor);
  const top = scale(min);
  const bottom = Math.max(scale(max), top + 6);

  return (
    <figure className={className} aria-label={`Depth range ${min} to ${max} metres`}>
      <svg viewBox={`0 0 260 ${height + 20}`} className="h-auto w-full overflow-visible">
        {zones.map((z) => {
          const y0 = scale(z.from) + 10;
          const hgt = scale(Math.min(z.to, floor)) - scale(z.from);
          return (
            <g key={z.name}>
              <rect x="60" y={y0} width="40" height={hgt} fill={z.tint} />
            </g>
          );
        })}
        <line x1="60" x2="60" y1="10" y2={height + 10} stroke="currentColor" strokeOpacity="0.4" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1="52" x2="60" y1={scale(t) + 10} y2={scale(t) + 10} stroke="currentColor" strokeOpacity="0.5" />
            <text x="46" y={scale(t) + 13} textAnchor="end" fill="currentColor" opacity="0.6" fontSize="9" className="annot">
              {t.toLocaleString("en-GB")} m
            </text>
          </g>
        ))}
        <motion.rect
          x="60"
          width="40"
          fill="var(--biolume)"
          initial={{ y: top + 10, height: 0, opacity: 0 }}
          animate={active ? { y: top + 10, height: bottom - top, opacity: 0.85 } : { y: top + 10, height: 0, opacity: 0 }}
          transition={{ duration: reduced ? 0 : 1.8, delay: active ? delay + 0.6 : 0, ease: EASE_OUT }}
        />
        {zones.map((z) => {
          const y0 = scale(z.from) + 10;
          const hgt = scale(Math.min(z.to, floor)) - scale(z.from);
          return (
            <g key={z.name}>
              {hgt > 70 && (
                <text
                  x="80"
                  y={y0 + hgt / 2}
                  textAnchor="middle"
                  transform={`rotate(-90 80 ${y0 + hgt / 2})`}
                  className="annot"
                  fill="currentColor"
                  opacity="0.5"
                  fontSize="8"
                  
                >
                  {z.name.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}
        <motion.g
          initial={{ opacity: 0, x: -10 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{ duration: 1, delay: active ? delay + 1.6 : 0, ease: EASE_OUT }}
        >
          <line x1="100" x2="122" y1={(top + bottom) / 2 + 10} y2={(top + bottom) / 2 + 10} stroke="var(--biolume)" />
          <text x="128" y={(top + bottom) / 2 + 6} fill="currentColor" fontSize="15" className="display" fontStyle="italic">
            {label}
          </text>
          <text x="128" y={(top + bottom) / 2 + 22} fill="currentColor" opacity="0.65" fontSize="9" className="annot">
            {approx ? "≈ " : ""}
            {min.toLocaleString("en-GB")}–{max.toLocaleString("en-GB")} M
          </text>
        </motion.g>
      </svg>
      <figcaption className="annot mt-2 opacity-50">Depth shown on a square-root scale.{approx ? " Range approximate — sources describe depth only qualitatively." : ""}</figcaption>
    </figure>
  );
}

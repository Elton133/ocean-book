"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";
import { Action } from "@/components/ui/Controls";
import { bez, bezPath, type Bezier } from "./geometry";

type Kind = "venous" | "gill" | "arterial";

/* Schematic, not anatomically scaled (viewBox 600×440). */
const PATHS: { kind: Kind; curve: Bezier }[] = [
  { kind: "venous", curve: [[300, 405], [235, 405], [200, 350], [200, 300]] },
  { kind: "venous", curve: [[300, 405], [365, 405], [400, 350], [400, 300]] },
  { kind: "gill", curve: [[200, 300], [175, 275], [150, 235], [160, 195]] },
  { kind: "gill", curve: [[400, 300], [425, 275], [450, 235], [440, 195]] },
  { kind: "arterial", curve: [[160, 195], [200, 150], [275, 190], [300, 245]] },
  { kind: "arterial", curve: [[440, 195], [400, 150], [325, 190], [300, 245]] },
  { kind: "arterial", curve: [[300, 245], [300, 190], [300, 120], [300, 60]] },
  { kind: "arterial", curve: [[300, 245], [292, 300], [310, 360], [300, 405]] },
];

const COLOR: Record<Kind, string> = {
  venous: "#a9b0bf",
  gill: "#a9b0bf",
  arterial: "#3fa2ff",
};

export function Circulation({ className = "" }: { className?: string }) {
  const { active, reduced, delay } = usePageMotion();
  const [jet, setJet] = useState(false);
  const jetRef = useRef(false);
  useEffect(() => {
    jetRef.current = jet;
  }, [jet]);
  const particles = useRef<(SVGCircleElement | null)[]>([]);
  const hearts = useRef<(SVGGElement | null)[]>([]);
  const mantle = useRef<SVGPathElement>(null);

  const PER = 5;

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let t0 = performance.now();
    let sysPhase = 0;
    let branchPhase = 0;
    let arterialT = 0;
    let otherT = 0;
    const tick = (now: number) => {
      const dt = Math.min(64, now - t0) / 1000;
      t0 = now;
      const jetting = jetRef.current;
      branchPhase += dt * 1.1;
      if (!jetting) sysPhase += dt * 1.1;
      const beat = (p: number) => 1 + 0.12 * Math.max(0, Math.sin(p * Math.PI * 2)) ** 6;
      const sys = hearts.current[0];
      if (sys) sys.setAttribute("transform", `translate(300 245) scale(${reduced ? 1 : beat(sysPhase)}) translate(-300 -245)`);
      [1, 2].forEach((k) => {
        const h = hearts.current[k];
        const cx = k === 1 ? 200 : 400;
        if (h) h.setAttribute("transform", `translate(${cx} 300) scale(${reduced ? 1 : beat(branchPhase + 0.3)}) translate(${-cx} -300)`);
      });
      if (mantle.current) {
        const squeeze = jetting && !reduced ? 0.92 : 1;
        const cur = parseFloat(mantle.current.dataset.s ?? "1");
        const next = cur + (squeeze - cur) * 0.1;
        mantle.current.dataset.s = String(next);
        mantle.current.setAttribute("transform", `translate(300 230) scale(${next}) translate(-300 -230)`);
      }
      arterialT += dt * (jetting ? 0.03 : 0.22) * (reduced ? 0 : 1);
      otherT += dt * 0.22 * (reduced ? 0 : 1);
      PATHS.forEach((p, i) => {
        for (let k = 0; k < PER; k++) {
          const el = particles.current[i * PER + k];
          if (!el) continue;
          const base = p.kind === "arterial" ? arterialT : otherT;
          const t = (base + k / PER) % 1;
          const [x, y] = bez(p.curve, t);
          el.setAttribute("cx", x.toFixed(1));
          el.setAttribute("cy", y.toFixed(1));
          if (p.kind === "gill") el.setAttribute("fill", t > 0.55 ? COLOR.arterial : COLOR.venous);
        }
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);

  useEffect(() => {
    if (!jet) return;
    const id = setTimeout(() => setJet(false), 3600);
    return () => clearTimeout(id);
  }, [jet]);

  return (
    <div className={className}>
      <div className="relative mx-auto w-full max-w-[min(90vh,640px)]">
        <svg viewBox="0 0 600 440" className="h-auto w-full overflow-visible" role="img" aria-label="Schematic of octopus circulation: two branchial hearts pump blood through two gills, where it turns blue with oxygen, then a central systemic heart pumps it to the head and body.">
          <defs>
            <radialGradient id="heart-fill" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#6fb6ff" />
              <stop offset="100%" stopColor="#1d4f8a" />
            </radialGradient>
          </defs>

          {/* mantle silhouette */}
          <motion.path
            ref={mantle}
            d="M300,20 C410,20 470,110 470,220 C470,330 400,420 300,420 C200,420 130,330 130,220 C130,110 190,20 300,20 Z"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeDasharray="2 5"
            initial={{ opacity: 0 }}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 1.2, delay: active ? delay : 0 }}
          />

          {/* vessels */}
          {PATHS.map((p, i) => (
            <motion.path
              key={i}
              d={bezPath(p.curve)}
              fill="none"
              stroke={p.kind === "arterial" ? COLOR.arterial : COLOR.venous}
              strokeOpacity="0.35"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: active ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 1.4, delay: active ? delay + 0.2 + i * 0.1 : 0, ease: EASE_OUT }}
            />
          ))}

          {/* gills */}
          {[160, 440].map((x, i) => (
            <motion.g
              key={x}
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: 1, delay: active ? delay + 0.8 + i * 0.1 : 0 }}
            >
              <ellipse cx={x + (i ? 5 : -5)} cy="240" rx="22" ry="58" fill="none" stroke="currentColor" strokeOpacity="0.5" transform={`rotate(${i ? 18 : -18} ${x} 240)`} />
              {Array.from({ length: 9 }, (_, k) => (
                <line
                  key={k}
                  x1={x - 18 + (i ? 5 : -5)}
                  x2={x + 18 + (i ? 5 : -5)}
                  y1={196 + k * 11}
                  y2={196 + k * 11}
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  transform={`rotate(${i ? 18 : -18} ${x} 240)`}
                />
              ))}
              <text x={x} y="160" textAnchor="middle" className="annot" fontSize="10" fill="currentColor" opacity="0.65">
                GILL
              </text>
            </motion.g>
          ))}

          {/* particles */}
          {PATHS.flatMap((p, i) =>
            Array.from({ length: PER }, (_, k) => (
              <circle
                key={`${i}-${k}`}
                ref={(el) => {
                  particles.current[i * PER + k] = el;
                }}
                r="3.4"
                fill={COLOR[p.kind]}
                opacity={active ? 0.95 : 0}
              />
            )),
          )}

          {/* hearts */}
          <g ref={(el) => { hearts.current[0] = el; }}>
            <path d="M300,268 C270,250 262,222 280,212 C290,206 300,214 300,222 C300,214 310,206 320,212 C338,222 330,250 300,268 Z" fill="url(#heart-fill)" stroke="#bfe0ff" strokeWidth="1" />
          </g>
          {[200, 400].map((cx, k) => (
            <g key={cx} ref={(el) => { hearts.current[k + 1] = el; }}>
              <circle cx={cx} cy="300" r="13" fill="#59607a" stroke="#c9cfdd" strokeWidth="1" />
            </g>
          ))}

          {/* labels */}
          <g className="annot" fontSize="10" fill="currentColor">
            <text x="300" y="296" textAnchor="middle" opacity="0.85">SYSTEMIC HEART</text>
            <text x="200" y="332" textAnchor="middle" opacity="0.65">BRANCHIAL</text>
            <text x="200" y="344" textAnchor="middle" opacity="0.65">HEART</text>
            <text x="400" y="332" textAnchor="middle" opacity="0.65">BRANCHIAL</text>
            <text x="400" y="344" textAnchor="middle" opacity="0.65">HEART</text>
            <text x="300" y="48" textAnchor="middle" opacity="0.55">TO HEAD</text>
            <text x="300" y="430" textAnchor="middle" opacity="0.55">BODY &amp; ARMS</text>
          </g>
        </svg>
      </div>

      <div className="mt-3 flex flex-col items-center gap-3" data-no-drag>
        <div className="annot flex items-center gap-5 opacity-80">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: COLOR.venous }} />Oxygen-poor</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: COLOR.arterial }} />Oxygen-rich (blue)</span>
        </div>
        <Action onClick={() => setJet(true)} disabled={jet}>
          {jet ? "Jetting…" : "Make it jet away"}
        </Action>
        <p className="min-h-[1.5rem] text-center text-sm italic opacity-75" aria-live="polite">
          {jet ? "The mantle squeezes; the systemic heart pauses briefly while the branchial hearts keep going." : "Crawling: all three hearts beating."}
        </p>
      </div>
    </div>
  );
}

/** Iron versus copper: why the blood is blue. */
export function BloodCompare({ className = "" }: { className?: string }) {
  const { active, delay } = usePageMotion();
  const items = [
    { who: "Human", pigment: "Hemoglobin", metal: "Fe", metalName: "iron", color: "#a3242a" },
    { who: "Octopus", pigment: "Hemocyanin", metal: "Cu", metalName: "copper", color: "#2f86e0" },
  ];
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {items.map((it, i) => (
        <motion.div
          key={it.who}
          initial={{ opacity: 0, y: 16 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.9, delay: active ? delay + 1.2 + i * 0.15 : 0, ease: EASE_OUT }}
          className="flex items-end gap-3"
        >
          <div className="relative h-20 w-6 overflow-hidden rounded-b-full border border-ivory/40">
            <motion.div
              className="absolute inset-x-0 bottom-0"
              style={{ background: it.color }}
              initial={{ height: "0%" }}
              animate={{ height: active ? "78%" : "0%" }}
              transition={{ duration: 1.6, delay: active ? delay + 1.4 + i * 0.2 : 0, ease: EASE_OUT }}
            />
          </div>
          <div>
            <p className="annot uppercase opacity-60">{it.who}</p>
            <p className="display text-xl italic">{it.pigment}</p>
            <p className="annot opacity-70">
              <span className="text-base">{it.metal}</span> — {it.metalName}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

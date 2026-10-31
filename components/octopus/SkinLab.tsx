"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";

type Pigment = "yellow" | "red" | "brown";

const PIGMENT: Record<Pigment, [number, number, number]> = {
  yellow: [226, 178, 64],
  red: [186, 58, 38],
  brown: [74, 40, 28],
};

interface Mode {
  id: string;
  label: string;
  note: string;
  levels: Record<Pigment, number>;
  /** 0 = uniform, 1 = strongly patchy */
  patch: number;
  patchScale: number;
  papillae: number;
  base: [number, number, number];
  shimmer: number;
}

/* Illustrative presets: proportions are a teaching model, not measurements. */
const MODES: Mode[] = [
  { id: "pale", label: "Pale", note: "Chromatophores contracted to points; white leucophores dominate.", levels: { yellow: 0.12, red: 0.08, brown: 0.06 }, patch: 0.1, patchScale: 1, papillae: 0.05, base: [232, 224, 210], shimmer: 0.25 },
  { id: "rest", label: "Resting red", note: "Red chromatophores widely expanded — the familiar rust-red.", levels: { yellow: 0.35, red: 0.85, brown: 0.35 }, patch: 0.25, patchScale: 1.4, papillae: 0.2, base: [214, 170, 150], shimmer: 0.15 },
  { id: "rock", label: "Rock", note: "Dark and pale patches with raised papillae break up the outline.", levels: { yellow: 0.45, red: 0.4, brown: 0.85 }, patch: 0.9, patchScale: 2.6, papillae: 0.85, base: [196, 186, 170], shimmer: 0.1 },
  { id: "kelp", label: "Kelp", note: "Yellow and brown dominate in streaks; red is held back.", levels: { yellow: 0.9, red: 0.25, brown: 0.6 }, patch: 0.7, patchScale: 4.2, papillae: 0.45, base: [190, 186, 140], shimmer: 0.35 },
  { id: "flash", label: "Flush", note: "Every chromatophore opens at once — a sudden darkening.", levels: { yellow: 0.6, red: 1, brown: 0.95 }, patch: 0.05, patchScale: 1, papillae: 0.3, base: [150, 70, 60], shimmer: 0 },
];

interface Cell {
  x: number;
  y: number;
  type: Pigment;
  r: number;
  cur: number;
  phase: number;
}

const noise = (x: number, y: number, s: number) =>
  0.5 +
  0.25 * Math.sin(x * 6.1 * s + y * 2.3 * s) +
  0.17 * Math.sin(x * 3.7 * s - y * 7.9 * s + 1.7) +
  0.08 * Math.sin((x + y) * 13.1 * s);

export function SkinLab({ className = "" }: { className?: string }) {
  const { active, reduced, delay } = usePageMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modeId, setModeId] = useState("rest");
  const [papillae, setPapillae] = useState(0.2);
  const mode = MODES.find((m) => m.id === modeId)!;
  const state = useRef({ mode, papillae, base: [...mode.base] as number[], pap: papillae });
  useEffect(() => {
    state.current.mode = mode;
    state.current.papillae = papillae;
  }, [mode, papillae]);

  const cells = useMemo<Cell[]>(() => {
    const out: Cell[] = [];
    const types: Pigment[] = ["yellow", "red", "red", "brown", "yellow"];
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let gy = 0; gy < 26; gy++) {
      for (let gx = 0; gx < 26; gx++) {
        out.push({
          x: (gx + 0.5 + (rand() - 0.5) * 0.9) / 26,
          y: (gy + 0.5 + (rand() - 0.5) * 0.9) / 26,
          type: types[Math.floor(rand() * types.length)],
          r: 0.6 + rand() * 0.6,
          cur: 0.2,
          phase: rand() * Math.PI * 2,
        });
      }
    }
    return out;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let size = 0;
    const resize = () => {
      size = canvas.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    let raf = 0;
    let t = 0;
    const frame = () => {
      t += 1;
      const s = state.current;
      const m = s.mode;
      for (let k = 0; k < 3; k++) s.base[k] += (m.base[k] - s.base[k]) * 0.06;
      s.pap += (s.papillae - s.pap) * 0.08;
      const cellSize = size / 26;

      // Leucophore / base layer
      ctx.fillStyle = `rgb(${s.base.map((v) => v | 0).join(",")})`;
      ctx.fillRect(0, 0, size, size);

      // Iridophore shimmer: a slow diagonal sheen of blue-green
      if (m.shimmer > 0) {
        const g = ctx.createLinearGradient(0, 0, size, size);
        const p = (Math.sin(t * 0.01) + 1) / 2;
        g.addColorStop(Math.max(0, p - 0.25), "rgba(80,190,200,0)");
        g.addColorStop(p, `rgba(90,200,210,${m.shimmer * 0.45})`);
        g.addColorStop(Math.min(1, p + 0.25), "rgba(80,190,200,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
      }

      // Chromatophores
      for (const c of cells) {
        const patchy = noise(c.x, c.y, m.patchScale);
        const local = (1 - m.patch) + m.patch * Math.max(0, Math.min(1, (patchy - 0.35) * 2.2));
        const target = m.levels[c.type] * local;
        c.cur += (target - c.cur) * (reduced ? 1 : 0.12);
        const breathe = reduced ? 0 : Math.sin(t * 0.03 + c.phase) * 0.04;
        const r = cellSize * (0.08 + 0.62 * Math.max(0, c.cur + breathe)) * c.r;
        const [cr, cg, cb] = PIGMENT[c.type];
        ctx.beginPath();
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.55 + 0.4 * c.cur})`;
        ctx.ellipse(c.x * size, c.y * size, r, r * 0.9, c.phase, 0, Math.PI * 2);
        ctx.fill();
        // radial muscle hints when expanded
        if (c.cur > 0.5 && cellSize > 14) {
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.25)`;
          ctx.lineWidth = 0.6;
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2 + c.phase;
            ctx.beginPath();
            ctx.moveTo(c.x * size + Math.cos(a) * r, c.y * size + Math.sin(a) * r);
            ctx.lineTo(c.x * size + Math.cos(a) * (r + cellSize * 0.18), c.y * size + Math.sin(a) * (r + cellSize * 0.18));
            ctx.stroke();
          }
        }
      }

      // Papillae: raised bumps lit from above
      if (s.pap > 0.03) {
        for (const c of cells) {
          if ((c.phase * 10) % 3 > 0.9) continue;
          const pr = cellSize * 0.9 * s.pap * c.r;
          const g = ctx.createRadialGradient(c.x * size - pr * 0.3, c.y * size - pr * 0.4, pr * 0.1, c.x * size, c.y * size, pr);
          g.addColorStop(0, `rgba(255,250,240,${0.35 * s.pap})`);
          g.addColorStop(0.6, "rgba(255,250,240,0)");
          g.addColorStop(1, `rgba(0,0,0,${0.35 * s.pap})`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(c.x * size, c.y * size, pr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (active && !reduced) raf = requestAnimationFrame(frame);
    };
    frame();
    if (reduced) {
      // Re-render once per change when motion is reduced.
      const id = setInterval(frame, 120);
      return () => {
        clearInterval(id);
        ro.disconnect();
      };
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [cells, active, reduced]);

  return (
    <div className={className}>
      <motion.div
        className="relative mx-auto aspect-square w-full max-w-[min(48vh,440px)]"
        initial={{ clipPath: "circle(0% at 50% 50%)" }}
        animate={{ clipPath: active ? "circle(50% at 50% 50%)" : "circle(0% at 50% 50%)" }}
        transition={{ duration: reduced ? 0 : 1.6, delay: active ? delay + 0.4 : 0, ease: EASE_OUT }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full rounded-full" aria-label={`Simulated octopus skin, ${mode.label} pattern`} role="img" />
        <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(0,0,0,0.65)] ring-1 ring-ivory/30" />
        {/* lens reticle */}
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full text-ivory/40">
          <line x1="50" y1="2" x2="50" y2="8" stroke="currentColor" strokeWidth="0.3" />
          <line x1="50" y1="92" x2="50" y2="98" stroke="currentColor" strokeWidth="0.3" />
          <line x1="2" y1="50" x2="8" y2="50" stroke="currentColor" strokeWidth="0.3" />
          <line x1="92" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.3" />
        </svg>
        <span className="annot absolute -right-2 top-6 rotate-90 opacity-60">× 40 — ILLUSTRATIVE</span>
      </motion.div>

      <div className="mx-auto mt-5 max-w-md" data-no-drag>
        <div className="flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label="Skin pattern">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={m.id === modeId}
              onClick={() => {
                setModeId(m.id);
                setPapillae(m.papillae);
              }}
              className={`annot border px-3 py-1.5 uppercase tracking-[0.16em] transition ${
                m.id === modeId ? "border-biolume bg-biolume text-abyss" : "border-ivory/25 hover:border-ivory/70"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <label className="mt-4 flex items-center gap-3">
          <span className="annot w-24 shrink-0 uppercase opacity-60">Papillae</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={papillae}
            onChange={(e) => setPapillae(parseFloat(e.target.value))}
            className="h-px w-full cursor-pointer appearance-none bg-ivory/30 accent-biolume"
            aria-label="Skin texture: smooth to raised papillae"
          />
          <span className="annot w-12 text-right opacity-60">{papillae < 0.33 ? "Smooth" : papillae < 0.66 ? "Bumpy" : "Raised"}</span>
        </label>
        <p className="mt-3 min-h-[2.5rem] text-center text-sm italic opacity-75">{mode.note}</p>
      </div>
    </div>
  );
}

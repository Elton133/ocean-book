"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useRef, useState } from "react";
import { usePageMotion } from "@/components/motion/PageContext";
import { Action } from "@/components/ui/Controls";

/** Side-view octopus, mantle first — the way it jets. */
function OctopusSide({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 90" className={className} aria-hidden>
      <path
        d="M8,44 C8,22 34,10 62,14 C84,17 96,30 100,40 C120,40 150,30 214,26 C170,40 140,44 118,48 C150,50 180,58 216,70 C176,66 140,60 110,56 C130,64 160,80 196,88 C150,84 118,70 98,60 C90,70 70,76 52,74 C26,72 8,64 8,44 Z"
        fill="#b9553a"
      />
      <circle cx="78" cy="38" r="5" fill="#f1e3cf" />
      <rect x="74" y="36.5" width="8" height="3" rx="1.5" fill="#1a1110" />
      <path d="M94,52 C100,56 104,60 106,64" stroke="#7a2f1f" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function InkEscape({ className = "" }: { className?: string }) {
  const { reduced } = usePageMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useAnimationControls();
  const [state, setState] = useState<"idle" | "escaping" | "gone">("idle");
  const ink = useRef<{ x: number; y: number; vx: number; vy: number; r: number; a: number; g: number }[]>([]);
  const running = useRef(false);

  const loop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    running.current = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const step = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of ink.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.965;
        p.vy = p.vy * 0.965 - 0.004;
        p.r += p.g;
        p.g *= 0.992;
        p.a *= 0.9965;
        if (p.a < 0.01) continue;
        alive++;
        const grad = ctx.createRadialGradient(p.x * w, p.y * h, 0, p.x * w, p.y * h, p.r);
        grad.addColorStop(0, `rgba(28,18,14,${p.a})`);
        grad.addColorStop(1, "rgba(28,18,14,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (alive) requestAnimationFrame(step);
      else running.current = false;
    };
    requestAnimationFrame(step);
  };

  const startle = async () => {
    if (state !== "idle") return;
    setState("escaping");
    // Ink leaves from the siphon, roughly mid-body.
    ink.current = Array.from({ length: reduced ? 30 : 110 }, () => ({
      x: 0.62 + (Math.random() - 0.5) * 0.04,
      y: 0.55 + (Math.random() - 0.5) * 0.06,
      vx: (Math.random() - 0.3) * 0.006,
      vy: (Math.random() - 0.5) * 0.005,
      r: 6 + Math.random() * 14,
      g: 0.5 + Math.random() * 0.9,
      a: 0.35 + Math.random() * 0.3,
    }));
    if (!running.current) loop();
    await controls.start({
      x: "-120%",
      scaleX: [1, 0.86, 1.08, 1],
      transition: { duration: reduced ? 0.2 : 1.1, ease: [0.15, 0.85, 0.2, 1] },
    });
    setState("gone");
    setTimeout(async () => {
      controls.set({ x: "60%", opacity: 0 });
      await controls.start({ x: "0%", opacity: 1, transition: { duration: reduced ? 0.2 : 2.4, ease: [0.16, 1, 0.3, 1] } });
      setState("idle");
    }, 3200);
  };

  return (
    <div className={className}>
      <div
        className="relative aspect-[16/10] w-full overflow-hidden border border-ivory/15"
        style={{ background: "radial-gradient(120% 90% at 70% 20%, rgba(111,214,200,0.18), transparent 60%), linear-gradient(180deg, #0f3a3e, #061a1e)" }}
      >
        {/* caustic light */}
        {!reduced && (
          <motion.div
            aria-hidden
            className="absolute -inset-1/4 opacity-25 mix-blend-screen"
            style={{ background: "repeating-radial-gradient(circle at 30% 20%, transparent 0 18px, rgba(180,255,240,0.25) 19px 20px, transparent 21px 40px)" }}
            animate={{ x: ["0%", "4%", "0%"], y: ["0%", "3%", "0%"], rotate: [0, 4, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/50 to-transparent" />
        <motion.div className="absolute left-[38%] top-[34%] w-[42%]" animate={controls} initial={{ x: "0%", opacity: 1 }}>
          <motion.div
            animate={state === "idle" && !reduced ? { y: [0, -6, 0] } : { y: 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <OctopusSide className="w-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
          </motion.div>
        </motion.div>
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
        <span className="annot absolute left-3 top-3 opacity-60">Fig. — Ink and jet escape (illustrative)</span>
      </div>
      <div className="mt-3 flex items-center gap-4" data-no-drag>
        <Action onClick={startle} disabled={state !== "idle"}>
          {state === "idle" ? "Startle it" : state === "escaping" ? "Escaping…" : "Gone."}
        </Action>
        <p className="text-sm italic opacity-70" aria-live="polite">
          {state === "idle" ? "A predator approaches…" : "Ink clouds the water while a jet from the siphon fires it away, mantle first."}
        </p>
      </div>
    </div>
  );
}

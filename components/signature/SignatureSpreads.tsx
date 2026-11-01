"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Creature } from "@/lib/types";
import type { PageProps } from "@/components/book/BookPage";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";
import { Reveal, Rule } from "@/components/motion/Reveal";
import { CertaintyTag, MarineSnow, Ref } from "@/components/media/Media";
import { ChapterMark, PageFrame, PageTitle, Side } from "@/components/pages/Frame";
import { HairlineSlider } from "@/components/ui/Controls";

/** Find a reference index by matching its title or publisher. */
const refOf = (c: Creature, re: RegExp) => {
  const i = c.references.findIndex((r) => re.test(r.title) || re.test(r.publisher));
  return i >= 0 ? i : undefined;
};

/** A figure variant or instruction set in type, not a button chip. */
const Btn = ({ on, onClick, children }: { on?: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    data-no-drag
    aria-pressed={on}
    className={`group relative mr-4 pb-1 transition-opacity duration-500 ${on === undefined ? "opacity-90 hover:opacity-100" : on ? "opacity-100" : "opacity-45 hover:opacity-85"}`}
  >
    {on === undefined && <span aria-hidden className="annot mr-1.5 opacity-60">↳</span>}
    <span className="display text-lg italic leading-none sm:text-xl">{children}</span>
    <span
      aria-hidden
      className={`absolute bottom-0 left-0 right-0 h-px origin-left bg-current transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"}`}
    />
  </button>
);

/* ===================================================================== */
/* Anglerfish: the living lantern                                        */
/* ===================================================================== */

/* Esca and mouth positions in the 0..1 frame space of the lure diagram. */
const ESCA = { x: 0.6, y: 0.24 };
const MOUTH = { x: 0.5, y: 0.52 };

export function LureSpread({ book, page }: PageProps) {
  const c = book.creature;
  const { active, reduced } = usePageMotion();
  const [glow, setGlow] = useState(0.8);
  const [snaps, setSnaps] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef(glow);
  useEffect(() => {
    glowRef.current = glow;
  }, [glow]);
  const jaw = useAnimationControls();
  const ref = refOf(c, /MBARI|bacteria|Monterey/i);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !active) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0,
      h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const prey = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.001,
      vy: (Math.random() - 0.5) * 0.001,
      s: 1.5 + Math.random() * 2.5,
      alive: true,
    }));
    let raf = 0;
    let t = 0;
    let cooldown = 0;
    const tick = () => {
      t++;
      const g = glowRef.current;
      ctx.clearRect(0, 0, w, h);
      // halo
      const flicker = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 0.07) * Math.sin(t * 0.013);
      const rad = Math.min(w, h) * (0.08 + 0.28 * g) * flicker;
      const grad = ctx.createRadialGradient(ESCA.x * w, ESCA.y * h, 0, ESCA.x * w, ESCA.y * h, rad);
      grad.addColorStop(0, `rgba(170,255,240,${0.55 * g})`);
      grad.addColorStop(0.3, `rgba(80,220,210,${0.18 * g})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      cooldown = Math.max(0, cooldown - 1);
      for (const p of prey) {
        if (!p.alive) {
          if (Math.random() < 0.004) Object.assign(p, { alive: true, x: Math.random() < 0.5 ? -0.02 : 1.02, y: Math.random() });
          continue;
        }
        const dx = ESCA.x - p.x;
        const dy = ESCA.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = g * 0.00004 * (1 / Math.max(0.15, dist));
        p.vx += (dx / dist) * pull + (Math.random() - 0.5) * 0.00012;
        p.vy += (dy / dist) * pull + (Math.random() - 0.5) * 0.00012;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += reduced ? 0 : p.vx;
        p.y += reduced ? 0 : p.vy;
        if (p.x < -0.05 || p.x > 1.05 || p.y < -0.05 || p.y > 1.05) p.alive = false;
        const near = Math.hypot(MOUTH.x - p.x, MOUTH.y - p.y) < 0.16 || dist < 0.07;
        if (near && cooldown === 0 && g > 0.2) {
          p.alive = false;
          cooldown = 50;
          setSnaps((s) => s + 1);
          jaw.start({ rotate: [0, 18, 0], transition: { duration: 0.35, times: [0, 0.25, 1] } });
        }
        const lit = Math.max(0, 1 - Math.hypot(ESCA.x - p.x, ESCA.y - p.y) / (0.1 + 0.4 * g));
        ctx.fillStyle = `rgba(200,240,255,${0.15 + 0.75 * lit})`;
        ctx.beginPath();
        ctx.ellipse(p.x * w, p.y * h, p.s * 1.6, p.s * 0.8, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active, reduced, jaw]);

  return (
    <div className="absolute inset-0 bg-black">
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-4 lg:justify-start">
            <ChapterMark chapter={page.chapter} label="Interactive" />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.2rem)] italic" />
            <Reveal delay={0.7}>
              <p className="lede mt-5 opacity-85">
                In the deep sea, a small light is one of the few things that can be seen. The female carries a modified fin spine — the illicium — tipped with a glowing bulb, the esca. The light is made by bacteria living inside it.
                <Ref n={ref} />
              </p>
            </Reveal>
            <Reveal delay={1} className="mt-6 space-y-2 text-sm opacity-75">
              <p><span className="annot mr-2 opacity-60">ILLICIUM</span>the ‘fishing rod’, a modified dorsal-fin ray</p>
              <p><span className="annot mr-2 opacity-60">ESCA</span>the lure, a sac of light-producing bacteria</p>
            </Reveal>
            <Reveal delay={1.2} className="mt-6">
              <CertaintyTag certainty="confirmed" />
            </Reveal>
          </Side>
          <Side part="b" className="flex flex-col justify-center lg:col-span-8">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
              <svg viewBox="0 0 800 500" className="absolute inset-0 h-full w-full" role="img" aria-label="Silhouette of a female anglerfish with a glowing lure above its open mouth">
                <defs>
                  <radialGradient id="esca">
                    <stop offset="0%" stopColor="#eafffb" />
                    <stop offset="60%" stopColor="#7ff0dc" />
                    <stop offset="100%" stopColor="#2a8a80" />
                  </radialGradient>
                </defs>
                {/* body */}
                <path d="M300,250 C300,150 420,120 520,150 C620,180 650,260 610,320 C580,370 500,390 420,380 C360,372 300,330 300,250 Z" fill="#0b0d10" stroke="#1f262c" />
                <path d="M610,300 C660,280 700,250 720,220 C716,280 700,330 720,390 C690,360 660,340 612,322 Z" fill="#0b0d10" stroke="#1f262c" />
                {/* lower jaw */}
                <motion.g animate={jaw} style={{ transformOrigin: "460px 300px" }}>
                  <path d="M300,262 C320,330 390,350 460,330 C430,320 380,300 340,262 Z" fill="#0f1215" stroke="#232b31" />
                  {[0, 1, 2, 3, 4, 5].map((k) => (
                    <path key={k} d={`M${330 + k * 18},${276 + k * 7} l6,-18 l5,16 z`} fill="#d8dee0" opacity="0.85" />
                  ))}
                </motion.g>
                {[0, 1, 2, 3, 4].map((k) => (
                  <path key={k} d={`M${318 + k * 20},${250 + k * 2} l5,18 l6,-17 z`} fill="#d8dee0" opacity="0.85" />
                ))}
                <circle cx="420" cy="215" r="5" fill="#2b3338" />
                {/* illicium and esca */}
                <path d="M410,160 C420,90 470,60 480,120" fill="none" stroke="#2a3238" strokeWidth="3" />
                <motion.circle
                  cx="480"
                  cy="122"
                  r="10"
                  fill="url(#esca)"
                  animate={reduced ? undefined : { r: [9, 11, 9] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  style={{ opacity: 0.25 + glow * 0.75 }}
                />
              </svg>
              <span className="annot absolute left-3 top-3 opacity-60">Illustrative — not to scale</span>
              <span className="annot absolute right-3 top-3 opacity-70">Prey taken: {snaps}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4" data-no-drag>
              <HairlineSlider className="flex-1" value={glow} onChange={setGlow} from="dark" to="bright" label="Lure brightness" />
              <p className="text-sm italic opacity-70">{glow < 0.15 ? "Dark: nothing comes." : glow < 0.6 ? "A faint glow — a few prey drift closer." : "Bright: prey are drawn within reach of the jaws."}</p>
            </div>
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

/* ===================================================================== */
/* Peacock mantis shrimp: eyes and hammers                               */
/* ===================================================================== */

const HUMAN_CONES = [
  { peak: 420, color: "#6c7bff" },
  { peak: 534, color: "#4fdc7c" },
  { peak: 564, color: "#ff6a5a" },
];
/* 12 narrow colour channels spread from UV to far red (schematic positions). */
const MANTIS = Array.from({ length: 12 }, (_, i) => 315 + i * 33);

const wlColor = (nm: number) => {
  if (nm < 400) return "#9a7cff";
  if (nm < 450) return "#6c7bff";
  if (nm < 495) return "#40b6ff";
  if (nm < 570) return "#4fdc7c";
  if (nm < 590) return "#ffe25a";
  if (nm < 620) return "#ffa94a";
  return "#ff5a4a";
};

export function MantisSpread({ book, page }: PageProps) {
  const c = book.creature;
  const { active, reduced, delay } = usePageMotion();
  const { part } = usePageMotion();
  const [chosen, setTab] = useState<"vision" | "strike">("vision");
  // On small screens the two subjects are two pages; on wide screens, a choice.
  const tab = part === "a" ? "vision" : part === "b" ? "strike" : chosen;
  const [who, setWho] = useState<"human" | "mantis">("mantis");
  const [slow, setSlow] = useState(true);
  const [strikeId, setStrikeId] = useState(0);
  const thoen = refOf(c, /Thoen|different form of color/i);
  const patek = refOf(c, /Patek|Deadly strike/i);

  const x = (nm: number) => ((nm - 300) / 420) * 600;
  const curve = (peak: number, width: number) => {
    let d = "";
    for (let nm = 300; nm <= 720; nm += 4) {
      const v = Math.exp(-((nm - peak) ** 2) / (2 * width * width));
      d += `${nm === 300 ? "M" : "L"}${x(nm).toFixed(1)},${(150 - v * 120).toFixed(1)} `;
    }
    return d;
  };

  return (
    <div className="absolute inset-0">
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 70% 40%, rgba(64,182,255,0.12), transparent 70%)" }} />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-4 lg:justify-start">
            <ChapterMark chapter={page.chapter} label="Interactive" />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.2rem)]" />
            <Reveal delay={0.6} className={`mt-6 flex gap-2 ${part === "all" ? "" : "hidden"}`}>
              <Btn on={tab === "vision"} onClick={() => setTab("vision")}>Vision</Btn>
              <Btn on={tab === "strike"} onClick={() => setTab("strike")}>Strike</Btn>
            </Reveal>
            <AnimatePresence mode="wait">
              {tab === "vision" ? (
                <motion.div key="v" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }} className="mt-6 space-y-4">
                  <p className="lede opacity-85">
                    Humans see colour with three types of cone. The peacock mantis shrimp has about twelve colour receptor types, each tuned to a narrow band from ultraviolet to red.
                    <Ref n={thoen} />
                  </p>
                  <div className="border-l border-biolume/60 pl-4">
                    <CertaintyTag certainty="confirmed" />
                    <p className="mt-1 text-sm leading-relaxed opacity-80">
                      Yet in tests it was worse than us at telling similar colours apart. More receptors did not mean finer colour vision.
                      <Ref n={thoen} />
                    </p>
                  </div>
                  <div className="border-l border-ivory/30 pl-4">
                    <CertaintyTag certainty="hypothesis" />
                    <p className="mt-1 text-sm leading-relaxed opacity-80">
                      One proposal: each receptor acts like a simple yes/no detector, allowing fast colour recognition without much brain processing.
                      <Ref n={thoen} />
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="s" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }} className="mt-6 space-y-4">
                  <p className="lede opacity-85">
                    A saddle-shaped spring in the striking limb stores energy and a latch releases it. The club swings so fast that the water tears into vapour bubbles — cavitation — which collapse and hit the prey a second time.
                    <Ref n={patek} />
                  </p>
                  <CertaintyTag certainty="confirmed" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col justify-center lg:col-span-8" data-no-drag>
            <AnimatePresence mode="wait">
              {tab === "vision" ? (
                <motion.div key="vision" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                  <svg viewBox="0 0 600 200" className="h-auto w-full overflow-visible" role="img" aria-label={who === "human" ? "Three broad human cone sensitivity curves" : "Twelve narrow mantis shrimp colour receptor curves from ultraviolet to red"}>
                    <defs>
                      <linearGradient id="spectrum" x1="0" x2="1">
                        {[300, 380, 420, 470, 520, 570, 600, 650, 720].map((nm) => (
                          <stop key={nm} offset={(nm - 300) / 420} stopColor={nm < 380 ? "#2a1f4a" : wlColor(nm)} />
                        ))}
                      </linearGradient>
                    </defs>
                    <rect x="0" y="160" width="600" height="10" fill="url(#spectrum)" />
                    {[300, 400, 500, 600, 700].map((nm) => (
                      <text key={nm} x={x(nm)} y="188" textAnchor="middle" fontSize="10" className="annot" fill="currentColor" opacity="0.6">
                        {nm} nm
                      </text>
                    ))}
                    <text x={x(340)} y="155" textAnchor="middle" fontSize="9" className="annot" fill="currentColor" opacity="0.5">UV</text>
                    <AnimatePresence>
                      {(who === "human" ? HUMAN_CONES.map((h) => ({ peak: h.peak, w: 42, color: h.color })) : MANTIS.map((p) => ({ peak: p, w: 9, color: wlColor(p) }))).map((k, i) => (
                        <motion.path
                          key={`${who}-${i}`}
                          d={curve(k.peak, k.w)}
                          fill="none"
                          stroke={k.color}
                          strokeWidth="1.6"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: active ? 1 : 0, opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: reduced ? 0 : 1, delay: active ? (who === "mantis" ? delay * 0 + i * 0.06 : i * 0.12) : 0, ease: EASE_OUT }}
                        />
                      ))}
                    </AnimatePresence>
                  </svg>
                  <div className="mt-4 flex items-center gap-3">
                    <Btn on={who === "human"} onClick={() => setWho("human")}>Human · 3 cones</Btn>
                    <Btn on={who === "mantis"} onClick={() => setWho("mantis")}>Mantis shrimp · ~12 colour types</Btn>
                  </div>
                  <p className="annot mt-3 opacity-50">Sensitivity curves are schematic; peak positions are illustrative.</p>
                </motion.div>
              ) : (
                <motion.div key="strike" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                  <StrikeDiagram slow={slow} play={strikeId} reduced={reduced} />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Btn onClick={() => setStrikeId((n) => n + 1)}>Strike</Btn>
                    <Btn on={slow} onClick={() => setSlow((s) => !s)}>{slow ? "Slow motion: on" : "Real time"}</Btn>
                    <p className="text-sm italic opacity-70">{slow ? "Slowed enormously so the two impacts can be seen." : "At real speed the whole strike is over in a few thousandths of a second."}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PageFrame>
    </div>
  );
}

function StrikeDiagram({ slow, play, reduced }: { slow: boolean; play: number; reduced: boolean }) {
  const arm = useAnimationControls();
  const bubble = useAnimationControls();
  const shell = useAnimationControls();
  useEffect(() => {
    if (!play) return;
    const k = slow && !reduced ? 1 : 0.05;
    (async () => {
      bubble.set({ scale: 0, opacity: 0 });
      arm.set({ rotate: -70 });
      await arm.start({ rotate: 8, transition: { duration: 0.9 * k, ease: [0.7, 0, 1, 0.6] } });
      shell.start({ x: [0, 6, -3, 0], transition: { duration: 0.4 * k } });
      await bubble.start({ scale: [0, 1, 0.2], opacity: [0, 0.9, 0], transition: { duration: 1.4 * k, times: [0, 0.6, 1] } });
      shell.start({ x: [0, 4, -2, 0], transition: { duration: 0.3 * k } });
      await arm.start({ rotate: -70, transition: { duration: 1.2 * k, ease: EASE_OUT } });
    })();
  }, [play, slow, reduced, arm, bubble, shell]);
  return (
    <svg viewBox="0 0 600 300" className="h-auto w-full" role="img" aria-label="Diagram of a mantis shrimp club swinging into a snail shell, with a cavitation bubble forming and collapsing at the impact point">
      <rect x="0" y="250" width="600" height="2" fill="currentColor" opacity="0.2" />
      {/* body */}
      <path d="M40,210 C80,170 170,165 230,180 L250,200 C200,220 110,228 40,230 Z" fill="#2f8f6e" opacity="0.9" />
      <circle cx="240" cy="168" r="9" fill="#5fd0a8" />
      {/* raptorial appendage */}
      <motion.g animate={arm} initial={{ rotate: -70 }} style={{ transformOrigin: "245px 195px" }}>
        <path d="M245,195 L330,195" stroke="#e85a7a" strokeWidth="14" strokeLinecap="round" />
        <circle cx="342" cy="196" r="16" fill="#ff7a8a" stroke="#ffd1d8" />
        <text x="342" y="226" textAnchor="middle" className="annot" fontSize="9" fill="currentColor" opacity="0.7">CLUB</text>
      </motion.g>
      {/* cavitation bubble */}
      <motion.circle cx="372" cy="200" r="26" fill="none" stroke="#bfefff" strokeWidth="2" initial={{ scale: 0, opacity: 0 }} animate={bubble} style={{ transformOrigin: "372px 200px" }} />
      {/* snail */}
      <motion.g animate={shell}>
        <path d="M380,248 C380,190 470,170 500,210 C520,240 490,250 460,248 Z" fill="#c9b18a" stroke="#8a7457" />
        <path d="M410,230 C420,205 460,200 470,220" fill="none" stroke="#8a7457" />
      </motion.g>
      <text x="372" y="150" textAnchor="middle" className="annot" fontSize="9" fill="currentColor" opacity="0.7">CAVITATION BUBBLE</text>
      <text x="16" y="24" className="annot" fontSize="10" fill="currentColor" opacity="0.5">ILLUSTRATIVE</text>
    </svg>
  );
}

/* ===================================================================== */
/* Barreleye: looking up through its own head                            */
/* ===================================================================== */

export function BarreleyeSpread({ book, page }: PageProps) {
  const c = book.creature;
  const { reduced } = usePageMotion();
  const [feeding, setFeeding] = useState(false);
  const [labels, setLabels] = useState(true);
  const mbari = refOf(c, /solve mystery|Robison|paradox/i);
  const pitch = feeding ? -62 : 0;
  // Eyes rotate relative to the head so they keep aiming at prey overhead.
  const eye = feeding ? 62 : 0;
  const T = { duration: reduced ? 0 : 2.2, ease: EASE_OUT };

  return (
    <div className="absolute inset-0">
      <MarineSnow density={60} />
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(50% 40% at 60% 10%, rgba(140,255,170,0.10), transparent 70%)" }} />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-4 lg:justify-start">
            <ChapterMark chapter={page.chapter} label="Interactive" />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.2rem)] italic" />
            <Reveal delay={0.6}>
              <p className="lede mt-5 opacity-85">
                Its tubular eyes sit inside a transparent, fluid-filled shield. Hovering level, it gazes straight up for the silhouettes of prey. To feed, it tilts its body upward — and rotates its eyes to keep the target in view.
                <Ref n={mbari} />
              </p>
            </Reveal>
            <Reveal delay={0.9} className="mt-6 border-l border-ivory/30 pl-4">
              <p className="text-sm leading-relaxed opacity-80">
                The two dark spots above the mouth that look like eyes are actually the nares — its organs of smell.
                <Ref n={refOf(c, /MBARI/i)} />
              </p>
            </Reveal>
          </Side>
          <Side part="b" className="flex flex-col items-center justify-center gap-4 lg:col-span-8">
            <svg viewBox="0 0 700 460" className="h-auto w-full max-w-3xl overflow-visible" role="img" aria-label={`Barreleye fish diagram, ${feeding ? "tilted upward to feed with eyes rotated forward" : "level with eyes pointing upward"}`}>
              {/* prey overhead */}
              <motion.g animate={reduced ? undefined : { x: [0, 14, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                <circle cx="330" cy="40" r="5" fill="#cfe" opacity="0.8" />
                <path d="M330,45 l-6,16 M330,45 l6,16 M330,45 l0,18" stroke="#cfe" opacity="0.5" />
                <text x="345" y="44" className="annot" fontSize="9" fill="currentColor" opacity="0.55">PREY</text>
              </motion.g>
              <motion.g animate={{ rotate: pitch }} transition={T} style={{ transformOrigin: "320px 290px" }}>
                {/* body */}
                <path d="M230,290 C230,250 280,236 340,240 C420,246 520,262 600,280 C620,284 640,270 660,262 C654,284 654,302 660,322 C640,312 620,298 600,302 C520,318 420,334 340,338 C280,340 230,328 230,290 Z" fill="#1b2a26" stroke="#3d5a52" />
                <path d="M420,250 C440,226 470,222 480,250" fill="#22322d" stroke="#3d5a52" />
                <path d="M400,330 C420,360 460,362 470,334" fill="#22322d" stroke="#3d5a52" />
                {/* mouth & nares */}
                <path d="M230,292 l-12,4 l12,4" fill="none" stroke="#6f8f86" strokeWidth="2" />
                <circle cx="246" cy="276" r="4" fill="#0c1412" stroke="#6f8f86" />
                {/* transparent shield */}
                <path d="M244,268 C250,190 330,178 370,214 C392,234 394,256 388,262 C340,256 290,258 244,268 Z" fill="rgba(160,240,220,0.08)" stroke="rgba(190,255,235,0.55)" />
                {/* tubular eye */}
                <motion.g animate={{ rotate: eye }} transition={T} style={{ transformOrigin: "318px 252px" }}>
                  <rect x="306" y="206" width="24" height="48" rx="10" fill="#0e1a17" stroke="#7fbfaa" />
                  <ellipse cx="318" cy="208" rx="13" ry="7" fill="#5cff9c" opacity="0.95" />
                  <motion.path d="M318,200 L318,60" stroke="#5cff9c" strokeDasharray="3 5" opacity="0.5" />
                </motion.g>
              </motion.g>
              <AnimatePresence>
                {labels && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="annot" fontSize="10" fill="currentColor">
                    <text x="420" y="160" opacity="0.75">TRANSPARENT SHIELD</text>
                    <line x1="415" y1="158" x2="372" y2="200" stroke="currentColor" opacity="0.35" />
                    <text x="120" y="180" opacity="0.75">TUBULAR EYE, GREEN LENS</text>
                    <line x1="240" y1="186" x2="304" y2="214" stroke="currentColor" opacity="0.35" />
                    <text x="120" y="360" opacity="0.75">NARES — SMELL, NOT SIGHT</text>
                    <line x1="200" y1="352" x2="244" y2="282" stroke="currentColor" opacity="0.35" />
                  </motion.g>
                )}
              </AnimatePresence>
              <text x="0" y="450" className="annot" fontSize="9" fill="currentColor" opacity="0.45">ILLUSTRATIVE — BASED ON ROBISON &amp; REISENBICHLER (2008)</text>
            </svg>
            <Reveal delay={1.1} className="flex flex-wrap justify-center">
              <Btn on={!feeding} onClick={() => setFeeding(false)}>Searching</Btn>
              <Btn on={feeding} onClick={() => setFeeding(true)}>Feeding</Btn>
              <Btn on={labels} onClick={() => setLabels((l) => !l)}>Labels</Btn>
            </Reveal>
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

/* ===================================================================== */
/* Dumbo octopus: flying underwater                                      */
/* ===================================================================== */

export function DumboSpread({ book, page }: PageProps) {
  const c = book.creature;
  const { reduced } = usePageMotion();
  const [mode, setMode] = useState<"fins" | "hop">("fins");
  const fins = refOf(c, /WoRMS|Wikipedia|Grimpoteuthis/i);
  const hadal = refOf(c, /hadal|Marine Biology/i);
  const rep = { repeat: Infinity, ease: "easeInOut" as const };
  const still = reduced;

  return (
    <div className="absolute inset-0">
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, #050b14, #02050a)" }} />
      <MarineSnow density={50} />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-4 lg:justify-start">
            <ChapterMark chapter={page.chapter} label="Interactive" />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.2rem)]" />
            <Reveal delay={0.6}>
              <p className="lede mt-5 opacity-85">
                Most octopuses jet water through a siphon. Dumbo octopuses mostly swim by flapping the two ear-like fins on their mantle — an economical way to move in the food-poor deep.
                <Ref n={fins} />
              </p>
            </Reveal>
            <Reveal delay={0.9} className="mt-6 border-l border-ivory/30 pl-4">
              <p className="text-sm leading-relaxed opacity-80">
                One filmed in the Java Trench at 6,957 m foraged in short hops across the mud, landing with arms and web spread before lifting off again.
                <Ref n={hadal} />
              </p>
            </Reveal>
          </Side>
          <Side part="b" className="relative flex flex-col items-center justify-center gap-4 lg:col-span-8">
            <svg viewBox="0 0 600 460" className="h-auto w-full max-w-2xl overflow-visible" role="img" aria-label={`Animated dumbo octopus, ${mode === "fins" ? "flapping its fins to swim" : "hopping along the seafloor"}`}>
              {mode === "hop" && <rect x="0" y="420" width="600" height="40" fill="#1a1712" opacity="0.8" />}
              <motion.g
                key={mode}
                animate={
                  still
                    ? undefined
                    : mode === "fins"
                      ? { y: [0, -18, 0], x: [0, 6, 0] }
                      : { y: [150, 40, 150, 150], x: [-120, 0, 120, 120] }
                }
                transition={mode === "fins" ? { duration: 2.4, ...rep } : { duration: 3.6, repeat: Infinity, times: [0, 0.4, 0.8, 1], ease: "easeInOut" }}
              >
                {/* web & arms */}
                <motion.path
                  d="M220,250 C200,330 230,370 300,380 C370,370 400,330 380,250 Z"
                  fill="#c98a86"
                  fillOpacity="0.35"
                  stroke="#f5c5c0"
                  strokeOpacity="0.4"
                  animate={still ? undefined : mode === "hop" ? { scaleX: [0.8, 1.25, 0.8, 0.8] } : { scaleX: [1, 0.92, 1] }}
                  transition={mode === "hop" ? { duration: 3.6, repeat: Infinity, times: [0, 0.4, 0.8, 1] } : { duration: 1.2, ...rep }}
                  style={{ transformOrigin: "300px 250px" }}
                />
                {[0, 1, 2, 3, 4, 5].map((k) => (
                  <path key={k} d={`M${236 + k * 26},260 C${226 + k * 30},320 ${220 + k * 32},350 ${222 + k * 31},376`} stroke="#f5c5c0" strokeOpacity="0.5" fill="none" />
                ))}
                {/* mantle: translucent gelatinous tissue */}
                <defs>
                  <radialGradient id="dumbo-skin" cx="45%" cy="35%" r="70%">
                    <stop offset="0%" stopColor="#f3c2b6" stopOpacity="0.95" />
                    <stop offset="60%" stopColor="#d98f86" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#8a4a52" stopOpacity="0.45" />
                  </radialGradient>
                </defs>
                <path d="M212,252 C204,170 246,96 300,96 C354,96 396,170 388,252 C356,268 244,268 212,252 Z" fill="url(#dumbo-skin)" stroke="#f6d3ca" strokeOpacity="0.5" />
                <path d="M250,140 C270,118 330,118 350,140" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="6" strokeLinecap="round" />
                <ellipse cx="258" cy="226" rx="7" ry="6" fill="#1a0e10" opacity="0.85" />
                <ellipse cx="342" cy="226" rx="7" ry="6" fill="#1a0e10" opacity="0.85" />
                {/* fins */}
                <motion.path
                  d="M222,160 C180,130 150,140 140,170 C170,180 200,180 222,178 Z"
                  fill="url(#dumbo-skin)"
                  stroke="#f6d3ca"
                  strokeOpacity="0.5"
                  animate={still ? undefined : { rotate: mode === "fins" ? [18, -22, 18] : [0, -10, 0] }}
                  transition={{ duration: mode === "fins" ? 1.2 : 3.6, ...rep }}
                  style={{ transformOrigin: "222px 170px" }}
                />
                <motion.path
                  d="M378,160 C420,130 450,140 460,170 C430,180 400,180 378,178 Z"
                  fill="url(#dumbo-skin)"
                  stroke="#f6d3ca"
                  strokeOpacity="0.5"
                  animate={still ? undefined : { rotate: mode === "fins" ? [-18, 22, -18] : [0, 10, 0] }}
                  transition={{ duration: mode === "fins" ? 1.2 : 3.6, ...rep }}
                  style={{ transformOrigin: "378px 170px" }}
                />
              </motion.g>
              <text x="0" y="20" className="annot" fontSize="9" fill="currentColor" opacity="0.45">ILLUSTRATIVE</text>
            </svg>
            <Reveal delay={1.1} className="flex flex-wrap justify-center">
              <Btn on={mode === "fins"} onClick={() => setMode("fins")}>Fin swimming</Btn>
              <Btn on={mode === "hop"} onClick={() => setMode("hop")}>Hop &amp; spread</Btn>
            </Reveal>
            <Rule className="absolute bottom-0 left-0 right-0" />
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

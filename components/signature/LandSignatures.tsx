"use client";

import Image from "next/image";
import { AnimatePresence, animate, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Creature } from "@/lib/types";
import type { PageProps } from "@/components/book/BookPage";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";
import { Reveal } from "@/components/motion/Reveal";
import { CertaintyTag, Ref } from "@/components/media/Media";
import { ChapterMark, PageFrame, PageTitle, Side } from "@/components/pages/Frame";

/** A sourced figure from the record, and the reference it came from. */
function figures(c: Creature) {
  const sd = c.realm === "land" ? c.signatureData : undefined;
  return {
    n: (k: string) => (typeof sd?.[k] === "number" ? (sd[k] as number) : undefined),
    ref: (k: string) => sd?.refs?.[k],
  };
}

const fmt = (v: number, d = 1) => v.toLocaleString("en-GB", { maximumFractionDigits: d });

/** The animal's own photograph as a round token that moves through a diagram. */
function Token({ c, size = 44 }: { c: Creature; size?: number }) {
  return (
    <span className="relative block overflow-hidden rounded-full border border-ivory/70 bg-deep shadow-[0_0_24px_rgba(0,0,0,0.6)]" style={{ width: size, height: size }}>
      {c.image && <Image src={c.image.src} alt="" fill sizes={`${size}px`} className="object-cover" style={{ objectPosition: c.image.focal }} />}
    </span>
  );
}

const Choice = ({ on, onClick, children }: { on?: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    data-no-drag
    aria-pressed={on}
    className={`group relative mr-4 pb-1 transition-opacity duration-500 ${on === undefined ? "opacity-90 hover:opacity-100" : on ? "opacity-100" : "opacity-45 hover:opacity-85"}`}
  >
    {on === undefined && <span aria-hidden className="annot mr-1.5 opacity-60">↳</span>}
    <span className="display text-lg italic leading-none sm:text-xl">{children}</span>
    <span aria-hidden className={`absolute bottom-0 left-0 right-0 h-px origin-left bg-current transition-transform duration-700 ${on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"}`} />
  </button>
);

/* ===================================================================== */
/* Cheetah: built for the sprint                                         */
/* ===================================================================== */

const TRACK = 100;

export function CheetahSpread({ book, page }: PageProps) {
  const c = book.creature;
  const { reduced } = usePageMotion();
  const { n, ref } = figures(c);
  const top = n("topSpeedMs");
  const stride = n("strideLengthM");
  const freq = n("strideFrequencyHz");
  const [slow, setSlow] = useState(1);
  const [run, setRun] = useState(0);
  const [steps, setSteps] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef(0);

  // One run along a 100 m track at the measured top speed, footfalls stamped every stride.
  useEffect(() => {
    if (!run || !top) return;
    const total = TRACK / top;
    const start = performance.now();
    const tick = (t: number) => {
      const secs = Math.min(total, (t - start) / 1000 / slow);
      const metres = secs * top;
      setSteps(stride ? Math.floor(metres / stride) : 0);
      if (secs < total) raf.current = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [run, top, stride, slow]);

  if (!top) return null;
  const secs = TRACK / top;
  const start = () => {
    setSteps(0);
    setDone(false);
    setRun((r) => r + 1);
  };

  return (
    <div className="absolute inset-0">
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 70% 45%, rgba(230,190,100,0.12), transparent 70%)" }} />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-4 lg:justify-start">
            <ChapterMark chapter={page.chapter} label="Interactive" />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.2rem)]" />
            <Reveal delay={0.6}>
              <p className="lede mt-5 opacity-85">
                Collars carrying GPS and motion sensors timed wild cheetahs on real hunts in Botswana. The fastest reached {fmt(top)} m/s — about {fmt(top * 3.6, 0)} km/h.
                <Ref n={ref("speed")} />
              </p>
            </Reveal>
            {stride && freq && (
              <Reveal delay={0.9} className="mt-6 border-l border-ivory/30 pl-4">
                <CertaintyTag certainty="confirmed" />
                <p className="mt-1 text-sm leading-relaxed opacity-80">
                  At speed each stride covers about {fmt(stride)} m, and it takes about {fmt(freq)} strides a second.
                  <Ref n={ref("stride")} />
                </p>
              </Reveal>
            )}
          </Side>

          <Side part="b" className="flex flex-col justify-center gap-6 lg:col-span-8">
            <div data-no-drag>
              <div className="annot flex justify-between text-[0.6rem] uppercase tracking-[0.18em] opacity-55">
                <span>0 m</span>
                <span>{TRACK} m</span>
              </div>
              <div className="relative mt-3 h-16">
                <div className="absolute inset-x-0 top-1/2 h-px bg-ivory/30" />
                {Array.from({ length: 11 }, (_, i) => (
                  <span key={i} aria-hidden className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-ivory/30" style={{ left: `${i * 10}%` }} />
                ))}
                {/* Footfalls, one per stride */}
                {stride &&
                  Array.from({ length: steps }, (_, i) => (
                    <motion.span
                      key={`${run}-${i}`}
                      aria-hidden
                      className="absolute top-[62%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-sand"
                      style={{ left: `${(((i + 1) * stride) / TRACK) * 100}%` }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.8 }}
                      transition={{ duration: 0.2 }}
                    />
                  ))}
                <motion.div
                  key={run}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  initial={{ left: "0%" }}
                  animate={{ left: run ? "100%" : "0%" }}
                  transition={{ duration: run && !reduced ? secs * slow : 0, ease: "linear" }}
                >
                  <Token c={c} />
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-ivory/15 pt-4">
              {[
                ["Time for 100 m", `${fmt(secs, 2)} s`],
                ["Strides", stride ? `${steps} of ${Math.ceil(TRACK / stride)}` : "—"],
                ["Top speed", `${fmt(top * 3.6, 0)} km/h`],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="annot text-[0.6rem] uppercase tracking-[0.18em] opacity-50">{k}</p>
                  <p className="display mt-1 text-2xl italic tabular-nums sm:text-3xl">{v}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center" data-no-drag>
              <Choice onClick={start}>{run ? "Run again" : "Run 100 m"}</Choice>
              <Choice on={slow === 1} onClick={() => setSlow(1)}>Real time</Choice>
              <Choice on={slow === 4} onClick={() => setSlow(4)}>Slowed ×4</Choice>
            </div>
            <AnimatePresence>
              {done && (
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE_OUT }} className="text-sm italic">
                  Time and stride count are worked out from the measured figures, not timed on a real 100 m run.
                </motion.p>
              )}
            </AnimatePresence>
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

/* ===================================================================== */
/* Elephant: voices below hearing                                        */
/* ===================================================================== */

/* The span of human hearing, roughly. */
const HUMAN_LOW = 20;
const HUMAN_HIGH = 20000;

const hzLabel = (hz: number) => (hz >= 1000 ? `${fmt(hz / 1000, 0)} kHz` : `${hz} Hz`);

/** Where an animal's sound sits against human hearing, on a log scale. */
function FrequencyScale({ from, to, band, who, active, reduced }: { from: number; to: number; band: [number, number]; who: string; active: boolean; reduced: boolean }) {
  const lo = Math.log10(from);
  const hi = Math.log10(to);
  const fx = (hz: number) => ((Math.log10(Math.min(Math.max(hz, from), to)) - lo) / (hi - lo)) * 100;
  const ticks = [1, 10, 100, 1000, 10000, 100000].filter((t) => t >= from && t <= to);
  // Very narrow bands still need to be seen.
  const width = Math.max(fx(band[1]) - fx(band[0]), 1.2);
  return (
    <div>
      <div className="relative h-10" role="img" aria-label={`Frequency scale: ${who} at ${hzLabel(band[0])} to ${hzLabel(band[1])}; human hearing from about ${HUMAN_LOW} Hz to 20 kHz`}>
        <motion.div
          className="absolute top-0 h-4 bg-ivory/20"
          style={{ left: `${fx(HUMAN_LOW)}%`, width: `${fx(HUMAN_HIGH) - fx(HUMAN_LOW)}%` }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: active ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 1.2, ease: EASE_OUT }}
        />
        <motion.div
          className="absolute top-5 h-4 bg-sand"
          style={{ left: `${fx(band[0])}%`, width: `${width}%` }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: active ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 0.5, ease: EASE_OUT }}
        />
        {[HUMAN_LOW, HUMAN_HIGH].map((hz) => (
          <span key={hz} aria-hidden className="absolute -top-1 bottom-0 w-px bg-ivory/60" style={{ left: `${fx(hz)}%` }} />
        ))}
      </div>
      <div className="annot relative mt-2 h-4 text-[0.6rem] uppercase tracking-[0.14em] opacity-55">
        {ticks.map((hz) => (
          <span key={hz} className="absolute -translate-x-1/2" style={{ left: `${fx(hz)}%` }}>
            {hzLabel(hz)}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-2 opacity-80"><span aria-hidden className="h-2 w-4 bg-ivory/30" /> Human hearing</span>
        <span className="inline-flex items-center gap-2 opacity-80"><span aria-hidden className="h-2 w-4 bg-sand" /> {who}</span>
      </div>
    </div>
  );
}

export function ElephantSpread({ book, page }: PageProps) {
  const c = book.creature;
  const { active, reduced } = usePageMotion();
  const { n, ref } = figures(c);
  const lo = n("rumbleHzMin");
  const hi = n("rumbleHzMax");
  const km = n("rangeKm");
  const [pulses, setPulses] = useState<number[]>([]);

  if (!lo || !hi) return null;
  const rumble = () => setPulses((p) => [...p.slice(-3), Date.now()]);

  return (
    <div className="absolute inset-0">
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 65% 50%, rgba(230,190,100,0.1), transparent 70%)" }} />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-5 lg:justify-start">
            <ChapterMark chapter={page.chapter} label="Interactive" />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.2rem)]" />
            <Reveal delay={0.6}>
              <p className="lede mt-5 opacity-85">
                Much of what elephants say, we cannot hear. Their rumbles have fundamental frequencies of about {fmt(lo, 0)}–{fmt(hi, 0)} Hz
                {hi <= HUMAN_LOW ? ", at and below" : ", reaching below"} the roughly {HUMAN_LOW} Hz floor of human hearing.
                <Ref n={ref("rumble")} />
              </p>
            </Reveal>
            {km && (
              <Reveal delay={0.9} className="mt-6 border-l border-ivory/30 pl-4">
                <CertaintyTag certainty="hypothesis" />
                <p className="mt-1 text-sm leading-relaxed opacity-80">
                  Low sound fades slowly. Modelling suggests that on calm nights a call could carry around {fmt(km, 0)} km.
                  <Ref n={ref("range")} />
                </p>
              </Reveal>
            )}
            {ref("seismic") != null && (
              <Reveal delay={1.1} className="mt-4 border-l border-ivory/30 pl-4">
                <CertaintyTag certainty="confirmed" />
                <p className="mt-1 text-sm leading-relaxed opacity-80">
                  The rumble also travels through the ground, and elephants appear to pick it up through their feet.
                  <Ref n={ref("seismic")} />
                </p>
              </Reveal>
            )}
          </Side>

          <Side part="b" className="flex flex-col justify-center gap-8 lg:col-span-7" >
            {/* Ripples spreading from the caller */}
            <div className="relative mx-auto aspect-square w-full max-w-sm" data-no-drag>
              {[0.25, 0.5, 0.75, 1].map((r) => (
                <span key={r} aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ivory/15" style={{ width: `${r * 100}%`, height: `${r * 100}%` }} />
              ))}
              {km && (
                <span className="annot absolute right-0 top-1/2 -translate-y-[140%] text-[0.6rem] uppercase tracking-[0.16em] opacity-50">≈ {fmt(km, 0)} km</span>
              )}
              <AnimatePresence>
                {pulses.map((id) =>
                  [0, 0.35, 0.7].map((d) => (
                    <motion.span
                      key={`${id}-${d}`}
                      aria-hidden
                      className="absolute left-1/2 top-1/2 rounded-full border border-sand"
                      initial={{ width: 0, height: 0, x: "-50%", y: "-50%", opacity: 0.9 }}
                      animate={{ width: "100%", height: "100%", opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduced ? 0.4 : 3.2, delay: reduced ? 0 : d, ease: "easeOut" }}
                      onAnimationComplete={() => d === 0.7 && setPulses((p) => p.filter((x) => x !== id))}
                    />
                  )),
                )}
              </AnimatePresence>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Token c={c} size={64} />
              </div>
            </div>

            {/* Where the rumble sits against human hearing */}
            <FrequencyScale from={1} to={20000} band={[lo, hi]} who="Elephant rumble" active={active} reduced={reduced} />

            <div data-no-drag>
              <Choice onClick={rumble}>Rumble</Choice>
            </div>
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

/* ===================================================================== */
/* Peregrine falcon: the stoop                                           */
/* ===================================================================== */

export function StoopSpread({ book, page }: PageProps) {
  const c = book.creature;
  const { active, reduced } = usePageMotion();
  const { n, ref } = figures(c);
  const stoop = n("stoopSpeedMs");
  const level = n("levelSpeedMs");
  const [dive, setDive] = useState(0);
  const [kmh, setKmh] = useState(level ? level * 3.6 : 0);

  // The readout climbs from level flight to the stoop as the falcon falls.
  useEffect(() => {
    if (!dive || !stoop) return;
    const from = (level ?? 0) * 3.6;
    const ctl = animate(from, stoop * 3.6, { duration: reduced ? 0 : 1.8, ease: [0.55, 0, 1, 0.45], onUpdate: setKmh });
    return () => ctl.stop();
  }, [dive, stoop, level, reduced]);

  if (!stoop) return null;
  const max = stoop * 3.6;

  return (
    <div className="absolute inset-0">
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(150,190,230,0.14), transparent 60%)" }} />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-5 lg:justify-start">
            <ChapterMark chapter={page.chapter} label="Interactive" />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.2rem)]" />
            <Reveal delay={0.6}>
              <p className="lede mt-5 opacity-85">
                To strike, a peregrine climbs high, folds its wings and drops. In that dive — the stoop — it has been measured at about {fmt(max, 0)} km/h ({fmt(stoop)} m/s).
                <Ref n={ref("stoop")} />
              </p>
            </Reveal>
            {level && (
              <Reveal delay={0.9} className="mt-6 border-l border-ivory/30 pl-4">
                <CertaintyTag certainty="confirmed" />
                <p className="mt-1 text-sm leading-relaxed opacity-80">
                  In ordinary flapping flight it is far slower: around {fmt(level * 3.6, 0)} km/h.
                  <Ref n={ref("level")} />
                </p>
              </Reveal>
            )}
          </Side>

          <Side part="b" className="flex flex-col justify-center gap-6 lg:col-span-7">
            <div className="grid grid-cols-[1fr_auto] items-stretch gap-8" data-no-drag>
              {/* The sky, top to ground */}
              <div className="relative h-[340px] border-l border-ivory/20">
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                  <span key={t} aria-hidden className="absolute -left-1 h-px w-2 bg-ivory/30" style={{ top: `${t * 100}%` }} />
                ))}
                <motion.div
                  key={dive}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  initial={{ top: "4%", left: "12%" }}
                  animate={dive ? { top: "96%", left: "70%" } : { top: "4%", left: "12%" }}
                  transition={{ duration: reduced || !dive ? 0 : 1.8, ease: [0.55, 0, 1, 0.45] }}
                >
                  <Token c={c} size={52} />
                </motion.div>
                {/* The streak it leaves */}
                {dive > 0 && !reduced && (
                  <motion.svg key={`t-${dive}`} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.line x1="12" y1="4" x2="70" y2="96" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 2" initial={{ pathLength: 0, opacity: 0.7 }} animate={{ pathLength: 1, opacity: [0.7, 0.7, 0] }} transition={{ duration: 2.6, ease: [0.55, 0, 1, 0.45] }} vectorEffect="non-scaling-stroke" />
                  </motion.svg>
                )}
              </div>
              <div className="flex w-36 flex-col justify-end">
                <p className="annot text-[0.6rem] uppercase tracking-[0.18em] opacity-50">Speed</p>
                <p className="display text-5xl italic tabular-nums">{fmt(kmh, 0)}</p>
                <p className="annot text-[0.6rem] uppercase tracking-[0.18em] opacity-50">km/h</p>
              </div>
            </div>

            {/* The two speeds side by side */}
            <div className="space-y-3">
              {[
                ["Level flight", level ? level * 3.6 : null],
                ["Stoop", max],
              ].map(([label, v]) =>
                v ? (
                  <div key={label as string} className="grid grid-cols-[7rem_1fr_4rem] items-center gap-3">
                    <span className="annot text-[0.6rem] uppercase tracking-[0.16em] opacity-60">{label}</span>
                    <motion.span
                      className="h-2 origin-left bg-sand"
                      style={{ width: `${((v as number) / max) * 100}%` }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: active ? 1 : 0 }}
                      transition={{ duration: reduced ? 0 : 1.2, ease: EASE_OUT }}
                    />
                    <span className="annot text-right tabular-nums opacity-80">{fmt(v as number, 0)}</span>
                  </div>
                ) : null,
              )}
            </div>

            <div data-no-drag>
              <Choice onClick={() => setDive((d) => d + 1)}>{dive ? "Stoop again" : "Stoop"}</Choice>
            </div>
            <p className="text-xs italic opacity-50">Illustrative: the dive is drawn, the speeds are measured.</p>
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

/* ===================================================================== */
/* Hummingbird: a blur of wings                                          */
/* ===================================================================== */

const SLOW = [1, 10, 50] as const;

export function HoverSpread({ book, page }: PageProps) {
  const c = book.creature;
  const { reduced } = usePageMotion();
  const { n, ref } = figures(c);
  const hz = n("wingbeatHz");
  const bpm = n("heartRateBpm");
  const [slow, setSlow] = useState<(typeof SLOW)[number]>(10);
  if (!hz) return null;

  const beat = hz / slow;
  // A screen redraws about 60 times a second, so anything much above ~12 beats a second can only be shown as a blur.
  const blur = beat > 12 || reduced;
  const heart = bpm ? bpm / 60 / slow : null;

  return (
    <div className="absolute inset-0">
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 65% 45%, rgba(200,80,90,0.12), transparent 70%)" }} />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-5 lg:justify-start">
            <ChapterMark chapter={page.chapter} label="Interactive" />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.2rem)]" />
            <Reveal delay={0.6}>
              <p className="lede mt-5 opacity-85">
                Hovering at a flower, a ruby-throated hummingbird beats its wings about {fmt(hz, 0)} times a second — too fast for our eyes, which see only a haze.
                <Ref n={ref("wingbeat")} />
              </p>
            </Reveal>
            {bpm && (
              <Reveal delay={0.9} className="mt-6 border-l border-ivory/30 pl-4">
                <CertaintyTag certainty="confirmed" />
                <p className="mt-1 text-sm leading-relaxed opacity-80">
                  Its heart keeps pace: up to about {fmt(bpm, 0)} beats a minute.
                  <Ref n={ref("heart")} />
                </p>
              </Reveal>
            )}
          </Side>

          <Side part="b" className="flex flex-col items-center justify-center gap-6 lg:col-span-7">
            <svg viewBox="-160 -120 320 240" className="h-auto w-full max-w-md overflow-visible" role="img" aria-label={`A hovering hummingbird, wings beating ${slow === 1 ? "at real speed, shown as a blur" : `${slow} times slower than life`}`}>
              {/* Wings: two strokes about the shoulder; at real speed they become a fan of light */}
              {[-1, 1].map((side) => (
                <g key={side} transform="translate(0,-10)">
                  {blur ? (
                    <path d={`M0 0 L${side * 130} -70 A150 150 0 0 ${side > 0 ? 1 : 0} ${side * 130} 60 Z`} fill="currentColor" opacity="0.12" />
                  ) : (
                    <motion.path
                      key={`${slow}-${side}`}
                      d={`M0 0 Q${side * 70} -40 ${side * 140} -20 Q${side * 80} 0 0 8 Z`}
                      fill="currentColor"
                      opacity="0.55"
                      style={{ originX: "0px", originY: "0px" }}
                      animate={{ rotate: side > 0 ? [-28, 26, -28] : [28, -26, 28] }}
                      transition={{ duration: 1 / beat, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </g>
              ))}
              {/* Body, throat and bill */}
              <ellipse cx="0" cy="20" rx="16" ry="48" fill="#3d6b4a" />
              <ellipse cx="0" cy="-30" rx="15" ry="14" fill="#3d6b4a" />
              <path d="M-10 -22 Q0 -4 10 -22 Q0 -14 -10 -22 Z" fill="#c4304a" />
              <line x1="0" y1="-44" x2="0" y2="-96" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
              {/* Heartbeat */}
              {heart && (
                <motion.circle
                  cx="0"
                  cy="6"
                  r="4"
                  fill="#e24a5c"
                  animate={reduced || heart > 12 ? { opacity: 0.9 } : { scale: [1, 1.8, 1], opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: heart > 12 ? 0 : 1 / heart, repeat: Infinity }}
                />
              )}
            </svg>

            <div className="grid w-full max-w-md grid-cols-2 gap-4 border-t border-ivory/15 pt-4 text-center">
              <div>
                <p className="annot text-[0.6rem] uppercase tracking-[0.18em] opacity-50">Wingbeats shown</p>
                <p className="display mt-1 text-3xl italic tabular-nums">{fmt(beat, 1)}/s</p>
              </div>
              <div>
                <p className="annot text-[0.6rem] uppercase tracking-[0.18em] opacity-50">In life</p>
                <p className="display mt-1 text-3xl italic tabular-nums">{fmt(hz, 0)}/s</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center" data-no-drag>
              {SLOW.map((s) => (
                <Choice key={s} on={slow === s} onClick={() => setSlow(s)}>
                  {s === 1 ? "Real speed" : `${s}× slower`}
                </Choice>
              ))}
            </div>
            <p className="text-xs italic opacity-50">Illustrative bird; the wingbeat {bpm ? "and heart rate are" : "is"} measured.</p>
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

/* ===================================================================== */
/* Horseshoe bat: seeing with sound                                      */
/* ===================================================================== */

export function EchoSpread({ book, page }: PageProps) {
  const c = book.creature;
  const { active, reduced } = usePageMotion();
  const { n, ref } = figures(c);
  const lo = n("callKhzMin");
  const hi = n("callKhzMax");
  const [call, setCall] = useState(0);
  const [moth, setMoth] = useState({ x: 78, y: 38 });
  if (!lo || !hi) return null;

  const ping = () => {
    setMoth({ x: 62 + Math.random() * 30, y: 18 + Math.random() * 64 });
    setCall((k) => k + 1);
  };
  const dist = Math.hypot(moth.x - 10, moth.y - 50);
  const t = reduced ? 0.01 : 1.1;

  return (
    <div className="absolute inset-0">
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 60% 45%, rgba(110,140,220,0.1), transparent 70%)" }} />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-5 lg:justify-start">
            <ChapterMark chapter={page.chapter} label="Interactive" />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.2rem)]" />
            <Reveal delay={0.6}>
              <p className="lede mt-5 opacity-85">
                In the dark, a greater horseshoe bat finds insects by their echoes. Its calls hold an almost constant pitch of about {fmt(lo, 0)}–{fmt(hi, 0)} kHz — four times higher than the top of human hearing.
                <Ref n={ref("call")} />
              </p>
            </Reveal>
            <Reveal delay={0.9} className="mt-6 border-l border-ivory/30 pl-4">
              <p className="text-sm leading-relaxed opacity-80">Send a call into the dark and watch the echo come back from a moth.</p>
            </Reveal>
          </Side>

          <Side part="b" className="flex flex-col justify-center gap-8 lg:col-span-7">
            <div className="relative aspect-[16/10] w-full border border-ivory/10 bg-black/30" data-no-drag>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                <AnimatePresence>
                  {call > 0 && (
                    <motion.g key={call}>
                      {/* Outgoing call */}
                      <motion.ellipse cx="10" cy="50" fill="none" stroke="#d6c69a" strokeWidth="0.5" vectorEffect="non-scaling-stroke" initial={{ rx: 0, ry: 0, opacity: 0.9 }} animate={{ rx: dist, ry: dist * 1.6, opacity: 0 }} transition={{ duration: t, ease: "linear" }} />
                      {/* Echo back from the moth */}
                      <motion.ellipse cx={moth.x} cy={moth.y} fill="none" stroke="#8ef0e4" strokeWidth="0.5" vectorEffect="non-scaling-stroke" initial={{ rx: 0, ry: 0, opacity: 0 }} animate={{ rx: dist, ry: dist * 1.6, opacity: [0, 0.9, 0] }} transition={{ duration: t, delay: t, ease: "linear" }} />
                    </motion.g>
                  )}
                </AnimatePresence>
              </svg>
              <div className="absolute left-[10%] top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Token c={c} size={48} />
              </div>
              <motion.span
                aria-hidden
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory"
                animate={{ left: `${moth.x}%`, top: `${moth.y}%`, opacity: call ? [0.15, 0.15, 1, 0.6] : 0.15 }}
                transition={{ left: { duration: 0 }, top: { duration: 0 }, opacity: { duration: t * 2, times: [0, 0.45, 0.55, 1] } }}
              />
              <span className="annot absolute bottom-2 right-3 text-[0.55rem] uppercase tracking-[0.16em] opacity-40">Illustrative</span>
            </div>

            <FrequencyScale from={10} to={200000} band={[lo * 1000, hi * 1000]} who="Bat's call" active={active} reduced={reduced} />

            <div data-no-drag>
              <Choice onClick={ping}>{call ? "Call again" : "Call"}</Choice>
            </div>
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

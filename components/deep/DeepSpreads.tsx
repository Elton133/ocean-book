"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Creature, Deep, MediaAsset, SenseKind } from "@/lib/types";
import type { PageProps } from "@/components/book/BookPage";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";
import { Reveal } from "@/components/motion/Reveal";
import { CertaintyTag, CinematicImage, Credit, Ref } from "@/components/media/Media";
import { ChapterMark, PageFrame, PageTitle, Side } from "@/components/pages/Frame";
import { LifeCycle } from "@/components/octopus/LifeCycle";

/*
 * The octopus book's deep chapters, rebuilt as templates any animal can
 * fill from data/deep/<slug>.json. Each one renders nothing if its section
 * is missing, and the book builder only adds chapters that have data.
 */

const deepOf = (c: Creature) => c.deep ?? ({} as Deep);
const mediaOf = (c: Creature, i: number): MediaAsset | null => [c.image, ...(c.gallery ?? [])][i] ?? null;
const pad = (n: number) => String(n).padStart(2, "0");

/** A quiet photograph behind a chapter, when the animal has a spare one. */
function Backdrop({ media, className = "" }: { media: MediaAsset | null; className?: string }) {
  if (!media) return null;
  return (
    <div className={`absolute inset-0 opacity-25 ${className}`}>
      <CinematicImage media={media} zoom={[1.1, 1.0]} depth={10} />
    </div>
  );
}

/* Anatomy: labels pinned to the animal's own photograph ------------------- */
export function DeepAnatomy({ book, page }: PageProps) {
  const c = book.creature;
  const a = deepOf(c).anatomy;
  const { active, reduced, delay } = usePageMotion();
  const [sel, setSel] = useState<string | null>(null);
  const media = a ? mediaOf(c, a.media) : null;
  if (!a || !media) return null;
  const current = a.hotspots.find((h) => h.id === sel) ?? a.hotspots[0];

  return (
    <PageFrame>
      <div className="grid h-full gap-10 lg:grid-cols-12 lg:gap-8">
        <Side part="a" className="flex flex-col lg:col-span-4">
          <ChapterMark chapter={page.chapter} label={c.group} />
          <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,5.4vw,5.6rem)]" />
          <Reveal delay={0.7}>
            <p className="lede mt-5 opacity-80">{a.lede}</p>
          </Reveal>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5">
            {a.stats.map((s, i) => (
              <Reveal key={s.label} delay={1 + i * 0.12} className="border-t border-ink/20 pt-3">
                <dt className="sr-only">{s.label}</dt>
                <dd className="display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-none">{s.value}</dd>
                <dd className="annot mt-1.5 leading-snug opacity-60">
                  {s.label}
                  <Ref n={s.ref} />
                </dd>
              </Reveal>
            ))}
          </dl>
        </Side>

        <Side part="b" className="flex flex-col justify-center gap-5 lg:col-span-8">
          <Reveal delay={0.2} from="none" duration={1.6}>
            <figure className="relative border border-ink/45 p-3 outline outline-1 outline-offset-[5px] outline-ink/20 sm:p-4" data-no-drag>
              <div className="flex items-baseline justify-between border-b border-ink/20 pb-2">
                <span className="display text-sm uppercase tracking-[0.3em]">Plate</span>
                <span className="display text-sm italic opacity-70">{c.taxonomy.family}</span>
              </div>
              {/* The photograph at its own proportions, so the labels sit exactly where they were placed */}
              <div className="relative mx-auto mt-2 w-full" style={{ aspectRatio: `${media.width} / ${media.height}`, maxHeight: "52vh", maxWidth: `calc(52vh * ${media.width / media.height})` }}>
                <Image src={media.src} alt={media.alt} fill sizes="(min-width:1024px) 55vw, 100vw" className="object-contain [filter:sepia(0.15)_contrast(1.05)]" />
                {a.hotspots.map((h, i) => {
                  const on = h.id === current.id;
                  return (
                    <motion.button
                      key={h.id}
                      type="button"
                      onClick={() => setSel(h.id)}
                      aria-pressed={on}
                      aria-label={h.label}
                      className="group absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${h.x}%`, top: `${h.y}%` }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                      transition={{ duration: reduced ? 0 : 0.6, delay: active ? delay + 0.9 + i * 0.1 : 0, ease: EASE_OUT }}
                    >
                      {!reduced && <span aria-hidden className={`absolute inset-0 rounded-full bg-ivory/50 ${on ? "animate-ping" : ""}`} />}
                      <span className={`relative block h-3.5 w-3.5 rounded-full border-2 shadow-[0_0_0_2px_rgba(0,0,0,0.35)] transition-all ${on ? "scale-125 border-ivory bg-rust" : "border-ivory bg-ink/60 group-hover:bg-rust"}`} />
                      <span className={`annot absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap bg-ink/70 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-ivory transition ${on ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        {h.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              <figcaption className="border-t border-ink/20 pt-2 text-center">
                <span className="display text-base italic">{c.scientificName}</span>
                <span className="annot opacity-60"> · tap a point to read about it</span>
              </figcaption>
            </figure>
          </Reveal>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="border-l-2 border-rust/70 pl-4"
              aria-live="polite"
            >
              <p className="display text-2xl italic">{current.label}</p>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed opacity-80">
                {current.text}
                <Ref n={current.ref} />
              </p>
            </motion.div>
          </AnimatePresence>
          <Credit media={media} />
        </Side>
      </div>
    </PageFrame>
  );
}

/* Senses: a ring of senses around the animal ------------------------------ */
const SENSE_MARK: Record<SenseKind, string> = {
  sight: "◉",
  hearing: "≋",
  smell: "∿",
  taste: "◇",
  touch: "✋",
  electroreception: "ϟ",
  echolocation: "))",
  magnetoreception: "⊕",
  heat: "☀",
  vibration: "〰",
  balance: "⊿",
  other: "✶",
};

export function DeepSenses({ book, page }: PageProps) {
  const c = book.creature;
  const s = deepOf(c).senses;
  const { active, reduced, delay } = usePageMotion();
  const [i, setI] = useState(0);
  if (!s?.senses.length) return null;
  const cur = s.senses[Math.min(i, s.senses.length - 1)];
  const n = s.senses.length;
  const at = (k: number) => {
    const a = (k / n) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(a) * 40, y: 50 + Math.sin(a) * 40, a };
  };
  const sel = at(i);

  return (
    <div className="absolute inset-0">
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-5 lg:justify-start">
            <ChapterMark chapter={page.chapter} label="Interactive" />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.2rem)]" />
            <Reveal delay={0.6}>
              <p className="lede mt-5 opacity-85">{s.lede}</p>
            </Reveal>
            <AnimatePresence mode="wait">
              <motion.div
                key={cur.name}
                initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                transition={{ duration: 0.55, ease: EASE_OUT }}
                className="mt-8 border-l border-biolume/50 pl-5"
                aria-live="polite"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <CertaintyTag certainty={cur.certainty} />
                  {cur.vsHuman && <span className="annot border border-ivory/30 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.16em] opacity-80">{cur.vsHuman === "absent in us" ? "A sense we lack" : `${cur.vsHuman} than ours`.replace("similar than ours", "Much like ours")}</span>}
                </div>
                <p className="display mt-2 text-3xl italic">{cur.name}</p>
                <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed opacity-85">
                  {cur.text}
                  <Ref n={cur.ref} />
                </p>
              </motion.div>
            </AnimatePresence>
          </Side>

          <Side part="b" className="flex items-center justify-center lg:col-span-7">
            <div className="relative aspect-square w-full max-w-[min(60vh,480px)]" data-no-drag>
              {[0.35, 0.62, 0.8].map((r) => (
                <span key={r} aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ivory/10" style={{ width: `${r * 100}%`, height: `${r * 100}%` }} />
              ))}
              {/* Sense waves travel out towards the chosen sense */}
              {!reduced && active && (
                <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                  {[0, 0.6, 1.2].map((d) => (
                    <motion.path
                      key={`${i}-${d}`}
                      d={`M ${50 + Math.cos(sel.a - 0.35) * 14} ${50 + Math.sin(sel.a - 0.35) * 14} A 14 14 0 0 1 ${50 + Math.cos(sel.a + 0.35) * 14} ${50 + Math.sin(sel.a + 0.35) * 14}`}
                      fill="none"
                      stroke="var(--biolume)"
                      strokeWidth="0.6"
                      style={{ originX: "50px", originY: "50px" }}
                      initial={{ scale: 1, opacity: 0.9 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 2, delay: d, repeat: Infinity, ease: "easeOut" }}
                    />
                  ))}
                </svg>
              )}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="relative block h-24 w-24 overflow-hidden rounded-full border border-ivory/60 bg-deep sm:h-28 sm:w-28">
                  {c.image && <Image src={c.image.src} alt="" fill sizes="112px" className="object-cover" style={{ objectPosition: c.image.focal }} />}
                </span>
              </div>
              {s.senses.map((x, k) => {
                const p = at(k);
                const on = k === i;
                return (
                  <motion.button
                    key={x.name}
                    type="button"
                    onClick={() => setI(k)}
                    aria-pressed={on}
                    className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.6, delay: active ? delay + 0.6 + k * 0.08 : 0, ease: EASE_OUT }}
                  >
                    <span aria-hidden className={`grid h-11 w-11 place-items-center rounded-full border text-base transition duration-500 ${on ? "border-biolume bg-biolume text-abyss" : "border-ivory/40 bg-black/40 group-hover:border-ivory"}`}>
                      {SENSE_MARK[x.kind]}
                    </span>
                    <span className={`annot whitespace-nowrap text-[0.6rem] uppercase tracking-[0.14em] transition ${on ? "opacity-100" : "opacity-55"}`}>{x.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

/* Inside the body: systems as numbered notes beside a living trace -------- */
export function DeepBody({ book, page }: PageProps) {
  const c = book.creature;
  const b = deepOf(c).body;
  const { active, reduced, delay } = usePageMotion();
  const [open, setOpen] = useState(0);
  if (!b?.systems.length) return null;
  return (
    <div className="absolute inset-0">
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-5 lg:justify-start">
            <ChapterMark chapter={page.chapter} />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.2rem)]" />
            <Reveal delay={0.6}>
              <p className="lede mt-5 opacity-85">{b.lede}</p>
            </Reveal>
            {/* A pulse line: the body at work */}
            <svg aria-hidden viewBox="0 0 300 60" className="mt-10 h-auto w-full max-w-md overflow-visible">
              <motion.path
                d="M0 30 H70 L82 30 L90 8 L100 52 L110 20 L118 30 H190 L202 30 L210 8 L220 52 L230 20 L238 30 H300"
                fill="none"
                stroke="var(--coral)"
                strokeWidth="1.4"
                initial={{ pathLength: 0 }}
                animate={active ? { pathLength: 1 } : { pathLength: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 2.4, delay: delay + 0.4, ease: "linear", repeat: Infinity, repeatDelay: 0.6 }}
              />
            </svg>
          </Side>
          <Side part="b" className="flex flex-col justify-center lg:col-span-7">
            <ol data-no-drag>
              {b.systems.map((s, k) => {
                const on = k === open;
                return (
                  <Reveal key={s.title} as="li" delay={0.8 + k * 0.1} className="border-t border-ivory/15">
                    <button type="button" onClick={() => setOpen(k)} aria-expanded={on} className="flex w-full items-baseline gap-5 py-4 text-left">
                      <span className="annot w-8 shrink-0 opacity-50">{pad(k + 1)}</span>
                      <span className={`display text-2xl leading-tight transition sm:text-3xl ${on ? "italic" : "opacity-70 hover:opacity-100"}`}>{s.title}</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reduced ? 0 : 0.5, ease: EASE_OUT }}
                          className="overflow-hidden"
                        >
                          <div className="pb-5 pl-13">
                            <CertaintyTag certainty={s.certainty} />
                            <p className="mt-1.5 max-w-xl text-[0.95rem] leading-relaxed opacity-85">
                              {s.text}
                              <Ref n={s.ref} />
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Reveal>
                );
              })}
            </ol>
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

/* The genome: chromosomes, size against ours, and what reading it showed --- */
const HUMAN = { diploid: 46, gb: 3.1 };

export function DeepGenome({ book, page }: PageProps) {
  const c = book.creature;
  const g = deepOf(c).genome;
  const { active, reduced, delay } = usePageMotion();
  if (!g) return null;
  const pairs = g.diploid ? Math.round(g.diploid / 2) : 0;
  const maxGb = Math.max(HUMAN.gb, g.genomeGb ?? 0);
  return (
    <div className="absolute inset-0">
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-5 lg:justify-start">
            <ChapterMark chapter={page.chapter} />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.2rem)]" />
            <Reveal delay={0.6}>
              <p className="lede mt-5 opacity-85">{g.lede}</p>
            </Reveal>
            <Reveal delay={0.8} className="mt-6">
              <span className="annot inline-flex items-center gap-2 border border-ivory/30 px-2 py-1 text-[0.6rem] uppercase tracking-[0.16em]">
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${g.sequenced ? "bg-biolume" : "bg-ivory/40"}`} />
                {g.sequenced ? `Reference genome published ${g.sequenced}` : "No reference genome yet"}
              </span>
            </Reveal>
            <ol className="mt-6 space-y-4">
              {g.findings.map((f, k) => (
                <Reveal key={f.title} as="li" delay={1 + k * 0.12} className="border-t border-ivory/15 pt-3">
                  <CertaintyTag certainty={f.certainty} />
                  <p className="display mt-1 text-xl">{f.title}</p>
                  <p className="mt-1 text-sm leading-relaxed opacity-80">
                    {f.text}
                    <Ref n={f.ref} />
                  </p>
                </Reveal>
              ))}
            </ol>
          </Side>

          <Side part="b" className="flex flex-col justify-center gap-10 lg:col-span-7">
            {pairs > 0 && (
              <figure>
                <p className="annot mb-3 text-[0.6rem] uppercase tracking-[0.18em] opacity-60">
                  Chromosomes · 2n = {g.diploid}
                  <Ref n={g.refs?.diploid} />
                  <span className="opacity-60"> · human 2n = {HUMAN.diploid}</span>
                </p>
                <div className="flex flex-wrap items-end gap-x-2 gap-y-3" role="img" aria-label={`${pairs} pairs of chromosomes`}>
                  {Array.from({ length: pairs }, (_, k) => {
                    // Illustrative: lengths simply taper, as karyotypes are conventionally ordered by size.
                    const h = 44 - (34 * k) / Math.max(1, pairs - 1);
                    return (
                      <span key={k} className="flex items-end gap-[2px]">
                        {[0, 1].map((s) => (
                          <motion.span
                            key={s}
                            className="block w-1.5 origin-bottom rounded-full bg-sand"
                            style={{ height: h }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: active ? 1 : 0 }}
                            transition={{ duration: reduced ? 0 : 0.6, delay: active ? delay + 0.4 + k * 0.025 : 0, ease: EASE_OUT }}
                          />
                        ))}
                      </span>
                    );
                  })}
                </div>
                <figcaption className="annot mt-2 text-[0.55rem] opacity-40">ILLUSTRATIVE — PAIRS ORDERED BY SIZE; LENGTHS NOT TO SCALE</figcaption>
              </figure>
            )}
            {g.genomeGb && (
              <figure className="space-y-3">
                <p className="annot text-[0.6rem] uppercase tracking-[0.18em] opacity-60">Genome size, billions of base pairs</p>
                {[
                  [c.commonName, g.genomeGb, g.refs?.genome, "bg-biolume"],
                  ["Human", HUMAN.gb, undefined, "bg-ivory/40"],
                ].map(([label, v, r, col]) => (
                  <div key={label as string} className="grid grid-cols-[8rem_1fr_3.5rem] items-center gap-3">
                    <span className="truncate text-sm opacity-80">{label as string}</span>
                    <motion.span
                      className={`h-3 origin-left ${col}`}
                      style={{ width: `${((v as number) / maxGb) * 100}%` }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: active ? 1 : 0 }}
                      transition={{ duration: reduced ? 0 : 1.2, delay: active ? delay + 0.8 : 0, ease: EASE_OUT }}
                    />
                    <span className="annot text-right tabular-nums opacity-80">
                      {(v as number).toLocaleString("en-GB", { maximumFractionDigits: 2 })}
                      <Ref n={r as number | undefined} />
                    </span>
                  </div>
                ))}
                <figcaption className="annot text-[0.55rem] opacity-40">HUMAN: ABOUT 3.1 BILLION BASE PAIRS (REFERENCE GENOME)</figcaption>
              </figure>
            )}
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

/* Behaviour and mind: the record of evidence ------------------------------ */
export function DeepMind({ book, page }: PageProps) {
  const c = book.creature;
  const m = deepOf(c).mind;
  const [sel, setSel] = useState(0);
  if (!m?.studies.length) return null;
  const s = m.studies[Math.min(sel, m.studies.length - 1)];
  const back = mediaOf(c, 1) ?? c.image;
  return (
    <div className="absolute inset-0">
      <Backdrop media={back} className="opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
      <PageFrame>
        <div className="flex h-full flex-col">
          <Side part="a" className="flex max-w-2xl flex-col">
            <ChapterMark chapter={page.chapter} />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6.5vw,7rem)]" />
            <Reveal delay={0.7}>
              <p className="lede mt-5 opacity-85">{m.lede}</p>
            </Reveal>
          </Side>
          <Side part="b" className="mt-auto grid gap-6 pt-10 lg:grid-cols-12">
            <Reveal delay={1} className="lg:col-span-5">
              <p className="annot mb-3 uppercase tracking-[0.2em] opacity-50">The evidence</p>
              <ol data-no-drag>
                {m.studies.map((st, k) => (
                  <li key={st.title}>
                    <button
                      type="button"
                      onClick={() => setSel(k)}
                      aria-pressed={sel === k}
                      className={`group flex w-full items-baseline gap-4 border-t border-ivory/15 py-2.5 text-left transition ${sel === k ? "opacity-100" : "opacity-55 hover:opacity-90"}`}
                    >
                      <span className="annot w-16 shrink-0 opacity-60">{st.year}</span>
                      <span className={`display text-xl leading-tight sm:text-2xl ${sel === k ? "italic" : ""}`}>{st.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </Reveal>
            <div className="lg:col-span-6 lg:col-start-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={sel}
                  initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                  className="border-l border-biolume/50 pl-5"
                >
                  <CertaintyTag certainty={s.certainty} />
                  <p className="display mt-2 text-3xl italic">{s.title}</p>
                  <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed opacity-85">
                    {s.text}
                    <Ref n={s.ref} />
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

/* Survival: how it stays alive, who hunts it, and what we do to it -------- */
export function DeepSurvival({ book, page }: PageProps) {
  const c = book.creature;
  const s = deepOf(c).survival;
  if (!s?.tactics.length) return null;
  const back = mediaOf(c, 2) ?? mediaOf(c, 1);
  return (
    <div className="absolute inset-0">
      <Backdrop media={back} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90" />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12 lg:gap-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-5 lg:justify-start">
            <ChapterMark chapter={page.chapter} />
            <PageTitle text={page.title} by="char" className="mt-4 text-[clamp(3.6rem,9vw,9rem)] italic" />
            <Reveal delay={0.6}>
              <p className="lede mt-4 max-w-md opacity-85">{s.lede}</p>
            </Reveal>
            {s.predators.length > 0 && (
              <Reveal delay={0.9} className="mt-6">
                <p className="annot mb-1 uppercase tracking-[0.2em] opacity-50">Hunted by</p>
                <p className="display text-xl italic opacity-90">{s.predators.join(" · ")}</p>
              </Reveal>
            )}
          </Side>
          <div className="flex flex-col justify-center gap-10 lg:col-span-7">
            <Side part="b">
              <ol className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {s.tactics.map((t, i) => (
                  <Reveal key={t.title} as="li" delay={1 + i * 0.1} className="border-t border-ivory/20 pt-3">
                    <p className="flex items-baseline gap-3">
                      <span className="annot opacity-50">{pad(i + 1)}</span>
                      <span className="display text-2xl">{t.title}</span>
                    </p>
                    <p className="mt-1 text-sm leading-relaxed opacity-75">
                      {t.text}
                      <Ref n={t.ref} />
                    </p>
                  </Reveal>
                ))}
              </ol>
            </Side>
            {s.threats && s.threats.length > 0 && (
              <Side part="c">
                <Reveal delay={1.5} className="border border-coral/40 p-4">
                  <p className="annot mb-2 uppercase tracking-[0.2em] text-coral">What threatens it</p>
                  <ul className="space-y-2">
                    {s.threats.map((t) => (
                      <li key={t.title} className="text-sm leading-relaxed opacity-85">
                        <span className="display text-lg italic">{t.title}. </span>
                        {t.text}
                        <Ref n={t.ref} />
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </Side>
            )}
          </div>
        </div>
      </PageFrame>
    </div>
  );
}

/* Life cycle: a ring that plays like a timeline --------------------------- */
export function DeepLife({ book, page }: PageProps) {
  const c = book.creature;
  const l = deepOf(c).life;
  if (!l?.stages.length) return null;
  const stages = l.stages.map((s) => ({ label: s.name, detail: s.duration ? `${s.duration}. ${s.text}` : s.text, ref: s.ref }));
  return (
    <div className="absolute inset-0">
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-5 lg:justify-start">
            <ChapterMark chapter={page.chapter} />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6.6vw,7rem)]" />
            <Reveal delay={0.7}>
              <p className="lede mt-5 max-w-md opacity-85">{l.lede}</p>
            </Reveal>
            {l.lifespan && (
              <Reveal delay={1} className="mt-8 border-t border-ivory/15 pt-4">
                <p className="annot uppercase tracking-[0.2em] opacity-50">Lifespan</p>
                <p className="display mt-1 text-3xl italic">
                  {l.lifespan.value}
                  <Ref n={l.lifespan.ref} />
                </p>
              </Reveal>
            )}
          </Side>
          <Side part="b" className="flex items-center justify-center lg:col-span-7">
            <LifeCycle stages={stages} className="w-full" />
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

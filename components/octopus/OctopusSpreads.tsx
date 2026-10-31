"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Certainty, MediaAsset } from "@/lib/types";
import type { PageProps } from "@/components/book/BookPage";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";
import { Parallax, Reveal, Rule, SplitText } from "@/components/motion/Reveal";
import { CertaintyTag, CinematicImage, Credit, MarineSnow, Ref, VideoClip } from "@/components/media/Media";
import { ChapterMark, PageFrame, PageTitle } from "@/components/pages/Frame";
import { TaxonomyLadder } from "@/components/diagrams/TaxonomyLadder";
import { DepthGauge } from "@/components/diagrams/DepthGauge";
import { AnatomyPlate, type Hotspot } from "./AnatomyPlate";
import { SkinLab } from "./SkinLab";
import { NervousSystem, NeuronSplit } from "./NervousSystem";
import { BloodCompare, Circulation } from "./Circulation";
import { InkEscape } from "./InkEscape";
import { LifeCycle, type Stage } from "./LifeCycle";
import { RangeArc } from "./RangeArc";

type D = Record<string, unknown>;
const data = <T,>(p: PageProps) => (p.page.data ?? {}) as T;

/** Volumetric light shafts drifting through the water column. */
function LightShafts({ className = "" }: { className?: string }) {
  const { reduced } = usePageMotion();
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen ${className}`}>
      {[
        { left: "12%", w: "9%", rot: 14, dur: 11, o: 0.16 },
        { left: "30%", w: "5%", rot: 18, dur: 14, o: 0.12 },
        { left: "58%", w: "12%", rot: 10, dur: 17, o: 0.1 },
        { left: "78%", w: "6%", rot: 16, dur: 12, o: 0.12 },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="absolute -top-[20%] h-[140%] origin-top blur-2xl"
          style={{ left: s.left, width: s.w, rotate: s.rot, background: `linear-gradient(180deg, rgba(190,240,235,${s.o}), transparent 75%)` }}
          animate={reduced ? undefined : { opacity: [0.4, 1, 0.5], rotate: [s.rot, s.rot + 4, s.rot] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* 01 — The Encounter --------------------------------------------------- */
export function OctoEncounter(p: PageProps) {
  const d = data<{ media: MediaAsset; lede: string; marks: string[]; refs: number[] }>(p);
  const { creature } = p.book;
  return (
    <div className="absolute inset-0">
      <CinematicImage media={d.media} priority zoom={[1.22, 1.04]} duration={18} depth={26} />
      <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-abyss via-transparent to-abyss/40" />
      <LightShafts />
      <MarineSnow density={90} />

      <div className="absolute inset-0 flex flex-col justify-end px-5 pb-36 sm:px-10 lg:px-16 lg:pb-32">
        <ChapterMark chapter={p.page.chapter} label={p.page.title} />
        <Parallax depth={-10}>
          <h1 className="display mt-5 text-[clamp(3.4rem,11.5vw,12.5rem)] leading-[0.84]">
            <SplitText text="Giant Pacific" by="char" delay={0.2} className="block" />
            <SplitText text="Octopus" by="char" delay={0.55} className="block italic text-[#f3c9b4]" />
          </h1>
        </Parallax>
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <Reveal delay={1.3} className="lg:col-span-5">
            <p className="annot mb-3 opacity-70">
              <em className="display text-lg not-italic">
                <i>{creature.scientificName}</i>
              </em>{" "}
              {creature.authority}
            </p>
            <p className="lede max-w-xl opacity-85">
              {d.lede}
              <Ref n={d.refs[0]} />
            </p>
          </Reveal>
        </div>
      </div>

      {/* Marginal annotations */}
      <Parallax depth={8} className="absolute right-5 top-28 hidden flex-col items-end gap-4 text-right md:flex lg:right-16">
        {d.marks.map((m, i) => (
          <Reveal key={m} delay={1.6 + i * 0.15} from="right" className="annot flex items-center gap-3 uppercase tracking-[0.2em] opacity-75">
            {m}
            <span className="h-px w-10 bg-current opacity-50" />
          </Reveal>
        ))}
      </Parallax>

      <Reveal delay={2.4} className="absolute bottom-28 right-5 hidden items-center gap-3 sm:flex lg:right-16">
        <span className="annot uppercase tracking-[0.2em] opacity-70">Drag, swipe or press →</span>
        <motion.span
          aria-hidden
          className="block h-px w-12 origin-left bg-ivory"
          animate={{ scaleX: [0.2, 1, 0.2], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </Reveal>
      <Credit media={d.media} className="absolute bottom-24 left-5 sm:left-10 lg:bottom-[5.5rem] lg:left-16" />
    </div>
  );
}

/* 02 — Meet the Octopus ----------------------------------------------- */
export function OctoMeet(p: PageProps) {
  const d = data<{
    kicker: string;
    lede: string;
    taxonomy: [string, string, string][];
    stats: { value: string; label: string; ref?: number }[];
    hotspots: Hotspot[];
  }>(p);
  return (
    <PageFrame>
      <div className="grid h-full gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col lg:col-span-3">
          <ChapterMark chapter={p.page.chapter} />
          <PageTitle text={p.page.title} className="mt-4 text-[clamp(3rem,5.4vw,5.6rem)]" />
          <Reveal delay={0.6}>
            <p className="display mt-3 text-xl italic text-rust">{d.kicker}</p>
          </Reveal>
          <div className="mt-8 hidden lg:block">
            <TaxonomyLadder rows={d.taxonomy} delay={0.6} />
          </div>
        </div>

        <div className="flex items-center lg:col-span-6">
          <AnatomyPlate hotspots={d.hotspots} className="w-full" />
        </div>

        <div className="flex flex-col justify-between gap-8 lg:col-span-3">
          <Reveal delay={0.9}>
            <p className="lede opacity-80">{d.lede}</p>
          </Reveal>
          <div className="lg:hidden">
            <TaxonomyLadder rows={d.taxonomy} />
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
            {d.stats.map((s, i) => (
              <Reveal key={s.label} delay={1.2 + i * 0.12} className="border-t border-ink/20 pt-3">
                <dt className="sr-only">{s.label}</dt>
                <dd className="display text-[clamp(1.8rem,2.6vw,2.6rem)] leading-none">{s.value}</dd>
                <dd className="annot mt-1.5 leading-snug opacity-60">
                  {s.label}
                  <Ref n={s.ref} />
                </dd>
              </Reveal>
            ))}
          </dl>
          <ScaleCompare />
        </div>
      </div>
    </PageFrame>
  );
}

/** Human height against a four-metre arm span. */
function ScaleCompare() {
  const { active, delay, reduced } = usePageMotion();
  const W = 260;
  const m = W / 5;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} 74`} className="h-auto w-full overflow-visible">
        <g className="annot" fontSize="7" fill="currentColor" opacity="0.55">
          {[0, 1, 2, 3, 4, 5].map((v) => (
            <g key={v}>
              <line x1={v * m} x2={v * m} y1="64" y2="68" stroke="currentColor" />
              <text x={v * m} y="74" textAnchor="middle">{v} m</text>
            </g>
          ))}
        </g>
        <line x1="0" x2={W} y1="64" y2="64" stroke="currentColor" strokeOpacity="0.3" />
        {/* human */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: active ? delay + 1.6 : 0 }}>
          <rect x="0" y="12" width={1.8 * m} height="10" fill="currentColor" fillOpacity="0.25" />
          <text x={1.8 * m + 6} y="20" fontSize="8" className="annot" fill="currentColor" opacity="0.8">PERSON 1.8 M</text>
        </motion.g>
        {/* arm span */}
        <motion.rect
          x="0"
          y="34"
          height="12"
          fill="var(--coral)"
          initial={{ width: 0 }}
          animate={{ width: active ? 4 * m : 0 }}
          transition={{ duration: reduced ? 0 : 1.8, delay: active ? delay + 1.8 : 0, ease: EASE_OUT }}
        />
        <motion.line
          x1={4 * m}
          x2={4.8 * m}
          y1="40"
          y2="40"
          stroke="var(--coral)"
          strokeDasharray="3 3"
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ delay: active ? delay + 3.4 : 0 }}
        />
        <text x="4" y="56" fontSize="8" className="annot" fill="currentColor" opacity="0.8">ARM SPAN — OFTEN OVER 4 M</text>
      </svg>
      <figcaption className="annot mt-1 opacity-50">Fig. 2 — Scale</figcaption>
    </figure>
  );
}

/* 03 — The Master of Disguise ----------------------------------------- */
export function OctoDisguise(p: PageProps) {
  const d = data<{
    lede: string;
    layers: { name: string; plain: string; ref?: number }[];
    paradox: { title: string; text: string; certainty: Certainty; ref?: number };
  }>(p);
  const [open, setOpen] = useState(0);
  return (
    <div className="absolute inset-0">
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(80% 70% at 70% 40%, rgba(111,214,200,0.14), transparent 70%)" }} />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col lg:col-span-5">
            <ChapterMark chapter={p.page.chapter} />
            <PageTitle text={p.page.title} className="mt-4 text-[clamp(3rem,6vw,6.4rem)]" />
            <Reveal delay={0.7}>
              <p className="lede mt-6 max-w-lg opacity-85">
                {d.lede}
                <Ref n={0} />
              </p>
            </Reveal>

            <div className="mt-8 space-y-0" data-no-drag>
              {d.layers.map((l, i) => (
                <Reveal key={l.name} delay={1 + i * 0.12}>
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-expanded={open === i}
                    className="group flex w-full items-baseline gap-4 border-t border-ivory/15 py-3 text-left"
                  >
                    <span className="annot opacity-50">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`display text-2xl transition ${open === i ? "italic text-biolume" : "opacity-80 group-hover:opacity-100"}`}>{l.name}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 0.8 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: EASE_OUT }}
                        className="overflow-hidden pb-3 pl-10 text-sm leading-relaxed"
                      >
                        {l.plain}
                        <Ref n={l.ref} />
                      </motion.p>
                    )}
                  </AnimatePresence>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center lg:col-span-7">
            <SkinLab />
            <Reveal delay={1.8} className="mx-auto mt-6 max-w-lg border-l border-biolume/60 pl-5">
              <div className="flex items-center gap-3">
                <p className="display text-xl italic">{d.paradox.title}</p>
                <CertaintyTag certainty={d.paradox.certainty} />
              </div>
              <p className="mt-1 text-sm leading-relaxed opacity-75">
                {d.paradox.text}
                <Ref n={d.paradox.ref} />
              </p>
            </Reveal>
          </div>
        </div>
      </PageFrame>
    </div>
  );
}

/* 04 — Eight Arms ------------------------------------------------------ */
export function OctoArms(p: PageProps) {
  const d = data<{ media: MediaAsset; lede: string; points: { title: string; text: string; certainty: Certainty; ref?: number }[] }>(p);
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-y-0 right-0 hidden w-[38%] lg:block">
        <CinematicImage media={d.media} sizes="40vw" zoom={[1.2, 1.06]} />
        <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/30 to-transparent" />
        <Credit media={d.media} className="absolute bottom-28 right-16 text-right" />
      </div>
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col lg:col-span-4">
            <ChapterMark chapter={p.page.chapter} />
            <PageTitle text="Eight Arms," className="mt-4 text-[clamp(2.8rem,5vw,5.4rem)]" />
            <SplitText as="p" text="Incredible Intelligence" delay={0.35} className="display block text-[clamp(2.2rem,3.6vw,3.8rem)] italic text-biolume" />
            <Reveal delay={0.8}>
              <p className="lede mt-6 opacity-85">
                {d.lede}
                <Ref n={6} />
              </p>
            </Reveal>
            <Reveal delay={1.1} className="mt-8 max-w-sm">
              <NeuronSplit />
            </Reveal>
          </div>
          <div className="flex items-center lg:col-span-4">
            <NervousSystem className="w-full" />
          </div>
          <div className="flex flex-col justify-end gap-6 lg:col-span-4 lg:pl-6">
            {d.points.map((pt, i) => (
              <Reveal key={pt.title} delay={1.4 + i * 0.15} className="relative bg-abyss/70 p-4 backdrop-blur-sm lg:bg-abyss/60">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="display text-2xl">{pt.title}</p>
                  <CertaintyTag certainty={pt.certainty} />
                </div>
                <p className="mt-1 text-sm leading-relaxed opacity-75">
                  {pt.text}
                  <Ref n={pt.ref} />
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </PageFrame>
    </div>
  );
}

/* 05 — Three Hearts, Blue Blood --------------------------------------- */
export function OctoHearts(p: PageProps) {
  const d = data<{ lede: string; notes: { title: string; text: string; certainty: Certainty; ref?: number }[] }>(p);
  return (
    <div className="absolute inset-0">
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 55% 50%, rgba(47,134,224,0.16), transparent 70%)" }} />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col lg:col-span-4">
            <ChapterMark chapter={p.page.chapter} />
            <h2 className="display mt-4 text-[clamp(3rem,6vw,6.4rem)] leading-[0.9]">
              <SplitText text="Three Hearts," delay={0.1} className="block" />
              <SplitText text="Blue Blood" delay={0.35} className="block italic text-[#6fb6ff]" />
            </h2>
            <Reveal delay={0.8}>
              <p className="lede mt-6 opacity-85">
                {d.lede}
                <Ref n={0} />
              </p>
            </Reveal>
            <BloodCompare className="mt-8 max-w-sm" />
          </div>
          <div className="flex items-center lg:col-span-5">
            <Circulation className="w-full" />
          </div>
          <div className="flex flex-col justify-center gap-8 lg:col-span-3">
            {d.notes.map((n, i) => (
              <Reveal key={n.title} delay={1.5 + i * 0.2}>
                <Rule delay={1.5 + i * 0.2} className="mb-4" />
                <CertaintyTag certainty={n.certainty} />
                <p className="display mt-2 text-2xl">{n.title}</p>
                <p className="mt-1 text-sm leading-relaxed opacity-75">
                  {n.text}
                  <Ref n={n.ref} />
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </PageFrame>
    </div>
  );
}

/* 06 — The Intelligent Alien ------------------------------------------ */
export function OctoMind(p: PageProps) {
  const d = data<{
    media: MediaAsset;
    lede: string;
    studies: { year: string; title: string; text: string; certainty: Certainty; ref?: number }[];
  }>(p);
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="absolute inset-0">
      <CinematicImage media={d.media} zoom={[1.04, 1.16]} duration={26} depth={14} focal="45% 8%" />
      <div className="absolute inset-0 bg-gradient-to-l from-abyss via-abyss/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/20 to-transparent" />
      <PageFrame className="lg:overflow-visible">
        <div className="flex h-full flex-col">
          <div className="ml-auto flex max-w-xl flex-col items-start lg:items-end lg:text-right">
            <ChapterMark chapter={p.page.chapter} />
            <h2 className="display mt-4 text-[clamp(3.2rem,7vw,7.6rem)] leading-[0.86]">
              <SplitText text="The Intelligent" by="char" delay={0.1} className="block" />
              <SplitText text="Alien" by="char" delay={0.5} className="block italic text-[#f3c9b4]" />
            </h2>
            <Reveal delay={0.9}>
              <p className="lede mt-5 opacity-85">{d.lede}</p>
            </Reveal>
          </div>

          <div className="mt-auto pt-10">
            <Reveal delay={1.2} className="annot mb-3 flex flex-wrap gap-5 opacity-80">
              <CertaintyTag certainty="confirmed" />
              <CertaintyTag certainty="hypothesis" />
              <CertaintyTag certainty="uncertain" />
            </Reveal>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-no-drag>
              {d.studies.map((s, i) => (
                <Reveal key={s.title} as="li" delay={1.3 + i * 0.12}>
                  <button
                    type="button"
                    onClick={() => setSel(sel === i ? null : i)}
                    aria-expanded={sel === i}
                    className={`group h-full w-full border p-4 text-left backdrop-blur-md transition duration-500 ${
                      sel === i ? "border-biolume/70 bg-abyss/80" : "border-ivory/15 bg-abyss/45 hover:border-ivory/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="annot opacity-60">{s.year}</span>
                      <CertaintyTag certainty={s.certainty} />
                    </div>
                    <p className="display mt-3 text-2xl leading-tight">{s.title}</p>
                    <motion.div
                      initial={false}
                      animate={{ height: sel === i ? "auto" : 0, opacity: sel === i ? 1 : 0 }}
                      transition={{ duration: 0.5, ease: EASE_OUT }}
                      className="overflow-hidden"
                    >
                      <p className="pt-2 text-sm leading-relaxed opacity-80">
                        {s.text}
                        <Ref n={s.ref} />
                      </p>
                    </motion.div>
                    {sel !== i && <span className="annot mt-2 block opacity-40 transition group-hover:opacity-80">Read +</span>}
                  </button>
                </Reveal>
              ))}
            </ol>
            <Credit media={d.media} className="mt-3" />
          </div>
        </div>
      </PageFrame>
    </div>
  );
}

/* 07 — Survival -------------------------------------------------------- */
export function OctoSurvival(p: PageProps) {
  const d = data<{ media: MediaAsset; lede: string; tactics: { title: string; text: string; ref?: number }[]; predators: string[] }>(p);
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 opacity-35">
        <CinematicImage media={d.media} zoom={[1.1, 1.0]} depth={10} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-teal/80 via-teal/85 to-abyss" />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col lg:col-span-5">
            <ChapterMark chapter={p.page.chapter} />
            <PageTitle text={p.page.title} by="char" className="mt-4 text-[clamp(3.6rem,9vw,9.5rem)] italic" />
            <Reveal delay={0.6}>
              <p className="lede mt-4 max-w-md opacity-85">
                {d.lede}
                <Ref n={0} />
              </p>
            </Reveal>
            <Reveal delay={0.9} className="mt-6">
              <p className="annot mb-2 uppercase opacity-50">Hunted by</p>
              <ul className="flex flex-wrap gap-2">
                {d.predators.map((x) => (
                  <li key={x} className="annot border border-ivory/25 px-2.5 py-1 uppercase tracking-[0.14em]">
                    {x}
                  </li>
                ))}
              </ul>
              <Credit media={d.media} className="mt-6" />
              <p className="annot opacity-50">Background: {d.media.caption}</p>
            </Reveal>
          </div>
          <div className="flex flex-col justify-center gap-6 lg:col-span-7">
            <Reveal delay={0.8} from="right">
              <InkEscape />
            </Reveal>
            <ol className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {d.tactics.map((t, i) => (
                <Reveal key={t.title} as="li" delay={1.2 + i * 0.1} className="border-t border-ivory/20 pt-3">
                  <p className="flex items-baseline gap-3">
                    <span className="annot opacity-50">{String(i + 1).padStart(2, "0")}</span>
                    <span className="display text-2xl">{t.title}</span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed opacity-75">
                    {t.text}
                    <Ref n={t.ref} />
                  </p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </PageFrame>
    </div>
  );
}

/* 08 — Its World ------------------------------------------------------- */
export function OctoWorld(p: PageProps) {
  const d = data<{ video: MediaAsset; lede: string; range: string[]; depth: { min: number; max: number } }>(p);
  return (
    <div className="absolute inset-0">
      <MarineSnow density={40} className="opacity-60" />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col lg:col-span-6">
            <ChapterMark chapter={p.page.chapter} />
            <PageTitle text={p.page.title} className="mt-4 text-[clamp(3.2rem,7vw,7rem)]" />
            <Reveal delay={0.6}>
              <p className="lede mt-4 max-w-xl opacity-85">
                {d.lede}
                <Ref n={1} />
              </p>
            </Reveal>
            <div className="mt-6 lg:mt-auto">
              <RangeArc places={d.range} className="max-w-2xl" />
            </div>
          </div>
          <div className="flex items-center lg:col-span-3">
            <DepthGauge min={d.depth.min} max={d.depth.max} label="G. P. octopus" height={420} className="mx-auto w-full max-w-[18rem]" />
          </div>
          <div className="lg:col-span-3">
            <div className="flex h-full flex-col justify-end gap-3">
              <Reveal delay={1.2} from="right">
                <VideoClip media={d.video} className="aspect-[4/5] w-full border border-ivory/15" />
              </Reveal>
              <Reveal delay={1.4}>
                <p className="text-sm italic opacity-75">{d.video.caption}</p>
                <Credit media={d.video} className="mt-1" />
              </Reveal>
              <Reveal delay={1.6} className="border-t border-ivory/20 pt-3">
                <p className="display text-xl">Middens</p>
                <p className="mt-1 text-sm leading-relaxed opacity-75">
                  Shells and crab remains piled outside a den — the octopus&apos;s discarded meals — tell divers someone is home.
                  <Ref n={0} />
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </PageFrame>
    </div>
  );
}

/* 09 — The Next Generation -------------------------------------------- */
export function OctoGeneration(p: PageProps) {
  const d = data<{ video: MediaAsset; still: MediaAsset; lede: string; stages: Stage[] }>(p);
  return (
    <div className="absolute inset-0">
      <VideoClip media={d.video} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/75 to-abyss/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-abyss/90 via-transparent to-abyss/60" />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-5">
            <ChapterMark chapter={p.page.chapter} />
            <h2 className="display mt-4 text-[clamp(3rem,6.6vw,7rem)] leading-[0.88]">
              <SplitText text="The Next" delay={0.1} className="block" />
              <SplitText text="Generation" delay={0.3} className="block italic text-[#f1df9a]" />
            </h2>
            <Reveal delay={0.7}>
              <p className="lede mt-5 max-w-md opacity-85">
                {d.lede}
                <Ref n={0} />
              </p>
            </Reveal>
            <Reveal delay={1} className="mt-auto hidden max-w-sm lg:block">
              <p className="text-sm italic opacity-70">{d.video.caption}</p>
              <Credit media={d.video} className="mt-1" />
            </Reveal>
          </div>
          <div className="flex items-center justify-center lg:col-span-7">
            <LifeCycle stages={d.stages} className="w-full" />
          </div>
        </div>
      </PageFrame>
    </div>
  );
}

export type { D };

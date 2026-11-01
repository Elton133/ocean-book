"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Certainty, MediaAsset } from "@/lib/types";
import type { PageProps } from "@/components/book/BookPage";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";
import { Parallax, Reveal, Rule, SplitText } from "@/components/motion/Reveal";
import { CertaintyTag, CinematicImage, Credit, MarineSnow, Ref, VideoClip } from "@/components/media/Media";
import { ChapterMark, PageFrame, PageTitle, Side } from "@/components/pages/Frame";
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

/* 01 — The Encounter: one enormous photograph, almost nothing else ------ */
export function OctoEncounter(p: PageProps) {
  const d = data<{ media: MediaAsset; lede: string; marks: string[]; refs: number[] }>(p);
  const { creature } = p.book;
  return (
    <div className="absolute inset-0">
      <CinematicImage media={d.media} priority zoom={[1.22, 1.04]} duration={18} depth={26} />
      <div className="absolute inset-0 bg-gradient-to-r from-abyss/90 via-abyss/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-abyss/90 via-transparent to-transparent" />
      <LightShafts />
      <MarineSnow density={90} />

      <div className="absolute inset-x-0 bottom-0 px-5 pb-32 sm:px-10 lg:px-16 lg:pb-28">
        <Parallax depth={-10}>
          <h1 className="display text-[clamp(3.4rem,11.5vw,12.5rem)] leading-[0.84]">
            <SplitText text="Giant Pacific" by="char" delay={0.4} className="block" />
            <SplitText text="Octopus" by="char" delay={0.75} className="block italic text-[#f3c9b4]" />
          </h1>
        </Parallax>
        <Reveal delay={1.5} className="mt-5 flex flex-wrap items-baseline gap-x-4">
          <i className="display text-xl opacity-85">{creature.scientificName}</i>
          <span className="annot opacity-55">{creature.authority}</span>
        </Reveal>
        <Reveal delay={1.9} className="mt-4 max-w-md lg:hidden">
          <p className="text-sm leading-relaxed opacity-75">
            {d.lede}
            <Ref n={d.refs[0]} />
          </p>
        </Reveal>
      </div>

      {/* A single caption, set like the line beneath a photograph in a book */}
      <Reveal delay={2.8} blur={false} className="absolute bottom-28 right-16 hidden max-w-sm text-right lg:block">
        <p className="display text-lg italic leading-snug opacity-80">
          {d.lede}
          <Ref n={d.refs[0]} />
        </p>
        <Credit media={d.media} className="mt-3" />
      </Reveal>
    </div>
  );
}

/* 02 — Meet the Octopus: a scientific plate --------------------------- */
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
        <Side part="a" className="flex flex-col lg:col-span-3">
          <ChapterMark chapter={p.page.chapter} />
          <PageTitle text={p.page.title} className="mt-4 text-[clamp(3rem,5.4vw,5.6rem)]" />
          <Reveal delay={0.6}>
            <p className="display mt-3 text-xl italic text-rust">{d.kicker}</p>
          </Reveal>
          <Reveal delay={0.8} className="lg:hidden">
            <p className="lede mt-5 opacity-80">{d.lede}</p>
          </Reveal>
          <div className="mt-8">
            <TaxonomyLadder rows={d.taxonomy} delay={0.6} />
          </div>
        </Side>

        <Side part="b" className="flex flex-col justify-center lg:col-span-6">
          <Reveal delay={0.2} from="none" duration={1.6}>
            <figure className="relative border border-ink/45 p-3 outline outline-1 outline-offset-[5px] outline-ink/20 sm:p-5">
              <div className="flex items-baseline justify-between border-b border-ink/20 pb-2">
                <span className="display text-sm uppercase tracking-[0.3em]">Plate II.</span>
                <span className="display text-sm italic opacity-70">Cephalopoda</span>
              </div>
              <AnatomyPlate hotspots={d.hotspots} className="w-full pt-2" />
              <figcaption className="border-t border-ink/20 pt-2 text-center">
                <span className="display text-base italic">Enteroctopus dofleini</span>
                <span className="annot opacity-60"> (Wülker, 1910). Oral view, schematic.</span>
              </figcaption>
            </figure>
          </Reveal>
          <dl className="mt-6 grid grid-cols-4 gap-x-4 lg:hidden">
            {d.stats.map((s) => (
              <div key={s.label}>
                <dd className="display text-2xl leading-none">{s.value}</dd>
                <dt className="annot mt-1 leading-snug opacity-60">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Side>

        <Side part="b" className="hidden flex-col justify-between gap-8 lg:col-span-3 lg:flex">
          <Reveal delay={0.9}>
            <p className="lede opacity-80">{d.lede}</p>
          </Reveal>
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
        </Side>
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
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: active ? delay + 1.6 : 0 }}>
          <rect x="0" y="12" width={1.8 * m} height="10" fill="currentColor" fillOpacity="0.25" />
          <text x={1.8 * m + 6} y="20" fontSize="8" className="annot" fill="currentColor" opacity="0.8">PERSON 1.8 M</text>
        </motion.g>
        <motion.rect
          x="0"
          y="34"
          height="12"
          fill="var(--rust)"
          initial={{ width: 0 }}
          animate={{ width: active ? 4 * m : 0 }}
          transition={{ duration: reduced ? 0 : 1.8, delay: active ? delay + 1.8 : 0, ease: EASE_OUT }}
        />
        <motion.line
          x1={4 * m}
          x2={4.8 * m}
          y1="40"
          y2="40"
          stroke="var(--rust)"
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
          <Side part="a" className="flex flex-col lg:col-span-5">
            <ChapterMark chapter={p.page.chapter} />
            <PageTitle text={p.page.title} className="mt-4 text-[clamp(3rem,6vw,6.4rem)]" />
            <Reveal delay={0.7}>
              <p className="lede mt-6 max-w-lg opacity-85">
                {d.lede}
                <Ref n={0} />
              </p>
            </Reveal>

            <div className="mt-8" data-no-drag>
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
          </Side>

          <Side part="b" className="flex flex-col justify-center lg:col-span-7">
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
          </Side>
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
          <Side part="a" className="flex flex-col justify-center lg:col-span-4 lg:justify-start">
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
          </Side>
          <Side part="b" className="flex items-center lg:col-span-4">
            <NervousSystem className="w-full" />
          </Side>
          <Side part="c" className="flex flex-col justify-center gap-7 lg:col-span-4 lg:justify-end lg:pl-6">
            {d.points.map((pt, i) => (
              <Reveal key={pt.title} delay={1.4 + i * 0.15} className="border-l border-biolume/50 pl-4 lg:bg-abyss/55 lg:py-3 lg:pr-3 lg:backdrop-blur-sm">
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
          </Side>
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
          <Side part="a" className="flex flex-col justify-center lg:col-span-4 lg:justify-start">
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
          </Side>
          <Side part="b" className="flex items-center lg:col-span-5">
            <Circulation className="w-full" />
          </Side>
          <Side part="c" className="flex flex-col justify-center gap-8 lg:col-span-3">
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
          </Side>
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
  const [sel, setSel] = useState(0);
  const s = d.studies[sel];
  return (
    <div className="absolute inset-0">
      <CinematicImage media={d.media} zoom={[1.04, 1.16]} duration={26} depth={14} focal="45% 8%" />
      <div className="absolute inset-0 bg-gradient-to-l from-abyss via-abyss/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/30 to-transparent" />
      <PageFrame>
        <div className="flex h-full flex-col">
          <Side part="a" className="ml-auto flex max-w-xl flex-1 flex-col items-start justify-end lg:flex-none lg:items-end lg:text-right">
            <ChapterMark chapter={p.page.chapter} />
            <h2 className="display mt-4 text-[clamp(3.2rem,7vw,7.6rem)] leading-[0.86]">
              <SplitText text="The Intelligent" by="char" delay={0.1} className="block" />
              <SplitText text="Alien" by="char" delay={0.5} className="block italic text-[#f3c9b4]" />
            </h2>
            <Reveal delay={0.9}>
              <p className="lede mt-5 opacity-85">{d.lede}</p>
            </Reveal>
            <Credit media={d.media} className="mt-4 lg:hidden" />
          </Side>

          {/* The record of evidence, read like an index of studies */}
          <Side part="b" className="mt-auto grid gap-6 pt-10 lg:grid-cols-12">
            <Reveal delay={1.2} className="lg:col-span-5">
              <p className="annot mb-3 uppercase tracking-[0.2em] opacity-50">The evidence</p>
              <ol data-no-drag>
                {d.studies.map((st, i) => (
                  <li key={st.title}>
                    <button
                      type="button"
                      onClick={() => setSel(i)}
                      aria-pressed={sel === i}
                      className={`group flex w-full items-baseline gap-4 border-t border-ivory/15 py-2.5 text-left transition ${sel === i ? "opacity-100" : "opacity-55 hover:opacity-90"}`}
                    >
                      <span className="annot w-16 shrink-0 opacity-60">{st.year}</span>
                      <span className={`display text-xl leading-tight sm:text-2xl ${sel === i ? "italic" : ""}`}>{st.title}</span>
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
              <Credit media={d.media} className="mt-6 hidden lg:block" />
            </div>
          </Side>
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
          <Side part="a" className="flex flex-col justify-center lg:col-span-5 lg:justify-start">
            <ChapterMark chapter={p.page.chapter} />
            <PageTitle text={p.page.title} by="char" className="mt-4 text-[clamp(3.6rem,9vw,9.5rem)] italic" />
            <Reveal delay={0.6}>
              <p className="lede mt-4 max-w-md opacity-85">
                {d.lede}
                <Ref n={0} />
              </p>
            </Reveal>
            <Reveal delay={0.9} className="mt-6">
              <p className="annot mb-1 uppercase tracking-[0.2em] opacity-50">Hunted by</p>
              <p className="display text-xl italic opacity-90">{d.predators.join(" · ")}</p>
              <Credit media={d.media} className="mt-6" />
              <p className="annot opacity-50">Background: {d.media.caption}</p>
            </Reveal>
          </Side>
          <div className="flex flex-col justify-center gap-6 lg:col-span-7">
            <Side part="b">
              <Reveal delay={0.8} from="right">
                <InkEscape />
              </Reveal>
            </Side>
            <Side part="c">
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
            </Side>
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
          <Side part="a" className="flex flex-col justify-center lg:col-span-6 lg:justify-start">
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
          </Side>
          <Side part="b" className="flex items-center lg:col-span-3">
            <DepthGauge min={d.depth.min} max={d.depth.max} label="G. P. octopus" height={420} className="mx-auto w-full max-w-[18rem]" />
          </Side>
          <Side part="c" className="lg:col-span-3">
            <div className="flex h-full flex-col justify-center gap-3 lg:justify-end">
              <Reveal delay={1.2} from="right">
                <VideoClip media={d.video} className="aspect-[4/5] max-h-[52vh] w-full border border-ivory/15" />
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
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

/* 09b — A Single Generation ------------------------------------------- */
export function OctoGeneration(p: PageProps) {
  const d = data<{ video: MediaAsset; still: MediaAsset; lede: string; stages: Stage[] }>(p);
  return (
    <div className="absolute inset-0">
      <CinematicImage media={d.still} zoom={[1.12, 1.02]} duration={22} depth={12} />
      <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/80 to-abyss/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-abyss/90 via-transparent to-abyss/60" />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-5 lg:justify-start">
            <ChapterMark chapter={p.page.chapter} />
            <h2 className="display mt-4 text-[clamp(3rem,6.6vw,7rem)] leading-[0.88]">
              <SplitText text="A Single" delay={0.1} className="block" />
              <SplitText text="Generation" delay={0.3} className="block italic text-[#f1df9a]" />
            </h2>
            <Reveal delay={0.7}>
              <p className="lede mt-5 max-w-md opacity-85">
                {d.lede}
                <Ref n={0} />
              </p>
            </Reveal>
            <Reveal delay={1} className="mt-6 max-w-sm lg:mt-auto">
              <p className="text-sm italic opacity-70">{d.still.caption}</p>
              <Credit media={d.still} className="mt-1" />
            </Reveal>
          </Side>
          <Side part="b" className="flex items-center justify-center lg:col-span-7">
            <LifeCycle stages={d.stages} className="w-full" />
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

export type { D };

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MediaAsset } from "@/lib/types";
import { EASE_CINE, EASE_OUT } from "@/lib/motion";
import { markFromLibrary } from "./CreatureLibrary";

export interface World {
  key: "land" | "air" | "sea";
  title: string;
  line: string;
  href: string;
  count: number;
  image: MediaAsset | null;
}

/**
 * Three worlds side by side. The one under the pointer widens and its
 * photograph comes forward; the others narrow and dim.
 */
export function WorldsTriptych({ worlds }: { worlds: World[] }) {
  const reduced = useReducedMotion();
  const [hot, setHot] = useState<World["key"] | null>(null);
  return (
    <section id="worlds" className="relative z-10 px-5 py-24 sm:px-10 md:pl-24 lg:px-16 lg:pl-28">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-15%" }} transition={{ duration: 1.2, ease: EASE_OUT }}>
        <p className="eyebrow opacity-60">Three worlds</p>
        <h2 className="display mt-4 max-w-3xl text-[clamp(2.6rem,5.5vw,5.5rem)] leading-[0.95]">
          On land, in the air, <i className="text-[#bfe9e2]">beneath the sea</i>
        </h2>
      </motion.div>
      <div className="mt-12 flex flex-col gap-3 lg:h-[64vh] lg:min-h-[460px] lg:flex-row" onPointerLeave={() => setHot(null)}>
        {worlds.map((w, i) => {
          const on = hot === w.key;
          const dim = hot && !on;
          return (
            <motion.div
              key={w.key}
              className="relative h-72 overflow-hidden lg:h-auto"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              animate={{ flexGrow: reduced ? 1 : on ? 1.9 : 1 }}
              transition={{ duration: reduced ? 0 : 0.9, ease: EASE_CINE, delay: reduced ? 0 : i * 0.08 }}
              style={{ flexBasis: 0 }}
              onPointerEnter={() => setHot(w.key)}
            >
              <Link href={w.href} className="group absolute inset-0 block" onFocus={() => setHot(w.key)} onBlur={() => setHot(null)}>
                {w.image && (
                  <motion.div className="absolute inset-0" animate={{ scale: on && !reduced ? 1.06 : 1, opacity: dim ? 0.45 : 1 }} transition={{ duration: 1.2, ease: EASE_OUT }}>
                    <Image src={w.image.src} alt={w.image.alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" style={{ objectPosition: w.image.focal }} />
                  </motion.div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="annot uppercase tracking-[0.2em] opacity-70">
                    {String(i + 1).padStart(2, "0")} · {w.count} {w.count === 1 ? "volume" : "volumes"}
                  </p>
                  <p className="display mt-2 text-[clamp(2.4rem,4vw,4rem)] leading-none">{w.title}</p>
                  <motion.p className="mt-3 max-w-sm text-sm leading-relaxed" animate={{ opacity: on || reduced ? 0.85 : 0.6 }}>
                    {w.line}
                  </motion.p>
                  <span className="eyebrow mt-5 inline-flex items-center gap-2 border-b border-ivory/40 pb-1 transition group-hover:border-ivory">
                    Enter <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export interface FeaturedVolume {
  slug: string;
  world: string;
  commonName: string;
  scientificName: string;
  summary: string;
  image: MediaAsset | null;
  chapters: { chapter: string; title: string }[];
}

/** Featured books, one per world, each with its table of contents. */
export function FeaturedVolumes({ volumes }: { volumes: FeaturedVolume[] }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const v = volumes[i];
  if (!v) return null;
  const ease = { duration: reduced ? 0.3 : 1.1, ease: EASE_OUT };
  const words = v.commonName.split(" ");

  return (
    <section id="featured" className="relative z-10 overflow-hidden px-5 py-28 sm:px-10 md:pl-24 lg:px-16 lg:pl-28">
      {/* The volume's photograph, faint behind the contents */}
      <AnimatePresence initial={false}>
        {v.image && (
          <motion.div key={v.slug} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 0.22 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
            <Image src={v.image.src} alt="" fill sizes="100vw" className="object-cover" style={{ objectPosition: v.image.focal }} />
            <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/80 to-abyss/40" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <div className="flex flex-wrap items-baseline gap-x-1" role="tablist" aria-label="Featured volumes">
          <p className="eyebrow mr-4 opacity-60">Featured volumes</p>
          {volumes.map((x, k) => (
            <span key={x.slug} className="inline-flex items-baseline">
              {k > 0 && <span aria-hidden className="mx-2 opacity-30">·</span>}
              <button role="tab" aria-selected={k === i} onClick={() => setI(k)} className={`relative pb-1 transition ${k === i ? "opacity-100" : "opacity-55 hover:opacity-90"}`}>
                <span className="annot mr-1.5 uppercase tracking-[0.16em] opacity-60">{x.world}</span>
                <span className="display text-lg italic">{x.commonName}</span>
                {k === i && <motion.span layoutId="featured-underline" className="absolute inset-x-0 bottom-0 h-px bg-ivory" transition={{ duration: 0.6, ease: EASE_OUT }} />}
              </button>
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={v.slug} className="mt-12 grid gap-12 lg:grid-cols-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: reduced ? 0.2 : 0.7, ease: EASE_OUT }}>
            <div className="lg:col-span-5">
              <h2 className="display text-[clamp(2.8rem,6vw,6rem)] leading-[0.95]">
                {words.slice(0, -1).join(" ")} <i className="text-[#f3c9b4]">{words.slice(-1)}</i>
              </h2>
              <p className="annot mt-2 italic opacity-60">{v.scientificName}</p>
              <p className="lede mt-6 max-w-md opacity-80">{v.summary}</p>
              <Link href={`/creatures/${v.slug}`} onClick={markFromLibrary} className="eyebrow mt-8 inline-flex items-center gap-3 border-b border-ivory/40 pb-1 transition hover:border-ivory">
                Begin reading · {v.chapters.length} chapters <span aria-hidden>→</span>
              </Link>
            </div>
            <ol className="lg:col-span-7">
              {v.chapters.map((ch, k) => (
                <motion.li key={ch.chapter + ch.title} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ ...ease, delay: reduced ? 0 : k * 0.04 }}>
                  <Link href={`/creatures/${v.slug}#${k + 1}`} onClick={markFromLibrary} className="group flex items-baseline gap-6 border-b border-ivory/12 py-3.5 transition-colors hover:border-ivory/50">
                    <span className="annot w-8 opacity-50">{ch.chapter}</span>
                    <span className="display text-[clamp(1.4rem,2.6vw,2.3rem)] leading-tight transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 group-hover:italic">{ch.title}</span>
                    <span className="ml-auto opacity-0 transition duration-500 group-hover:opacity-70">→</span>
                  </Link>
                </motion.li>
              ))}
            </ol>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { ShowcaseSlide } from "@/lib/catalogue";
import { EASE_CINE, EASE_OUT } from "@/lib/motion";
import { markFromLibrary } from "./CreatureLibrary";

/** How long each animal holds the screen. */
export const SLIDE_MS = 7000;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The photographs: each new animal wipes in over the last like a curtain
 * drawn across, then drifts slowly while it holds.
 */
export function ShowcaseImages({ slides, index, reduced }: { slides: ShowcaseSlide[]; index: number; reduced: boolean }) {
  const s = slides[index];
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={s.slug}
        className="absolute inset-0 overflow-hidden"
        initial={reduced ? { opacity: 0, zIndex: 2 } : { clipPath: "inset(0 0 0 100%)", zIndex: 2 }}
        animate={reduced ? { opacity: 1, zIndex: 2 } : { clipPath: "inset(0 0 0 0%)", zIndex: 2 }}
        exit={{ zIndex: 1, opacity: 0, transition: { opacity: { duration: 0.4, delay: reduced ? 0 : 1.4 } } }}
        transition={{ duration: reduced ? 0.8 : 1.5, ease: EASE_CINE }}
      >
        <motion.div
          className="absolute inset-0"
          initial={reduced ? false : { scale: 1.16, x: "4%" }}
          animate={{ scale: 1.04, x: "0%" }}
          transition={{ duration: reduced ? 0 : SLIDE_MS / 1000 + 2, ease: EASE_OUT }}
        >
          <Image
            src={s.image.src}
            alt={s.image.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: s.image.focal ?? "50% 50%" }}
          />
        </motion.div>
        {/* The edge of the curtain: a hairline of light that crosses with the wipe */}
        {!reduced && (
          <motion.span
            aria-hidden
            className="absolute inset-y-0 w-px bg-ivory/70 shadow-[0_0_24px_4px_rgba(239,232,218,0.35)]"
            initial={{ left: "100%", opacity: 1 }}
            animate={{ left: "0%", opacity: 0 }}
            transition={{ left: { duration: 1.5, ease: EASE_CINE }, opacity: { duration: 0.3, delay: 1.3 } }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/** Who is on screen, where they live, and the way into their book; with a strip to jump between animals. */
export function ShowcaseCaption({
  slides,
  index,
  reduced,
  paused,
  onPick,
}: {
  slides: ShowcaseSlide[];
  index: number;
  reduced: boolean;
  paused: boolean;
  onPick: (i: number) => void;
}) {
  const s = slides[index];
  return (
    <div className="text-right">
      <p className="annot uppercase tracking-[0.2em] opacity-60">
        Now showing · {pad(index + 1)} / {pad(slides.length)}
      </p>
      <div className="relative mt-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={s.slug}
            initial={reduced ? { opacity: 0 } : { y: "60%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: "-60%", opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <Link href={`/creatures/${s.slug}`} onClick={markFromLibrary} className="group inline-block">
              <span className="display block text-2xl italic leading-tight transition group-hover:opacity-80 sm:text-3xl">{s.commonName}</span>
              <span className="annot block opacity-60">{s.scientificName}</span>
              <span className="annot mt-1 inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.16em] opacity-70">
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${s.realm === "ocean" ? "bg-biolume" : "bg-[#e7cf98]"}`} />
                {s.place}
                <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex justify-end gap-1.5" role="tablist" aria-label="Animals in the showcase">
        {slides.map((x, i) => (
          <button
            key={x.slug}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={x.commonName}
            onClick={() => onPick(i)}
            className="group relative h-4 w-5 sm:w-7"
          >
            <span className="absolute inset-x-0 top-1/2 h-px bg-ivory/25 transition group-hover:bg-ivory/60" />
            {i === index && (
              <motion.span
                key={`${x.slug}-${paused}`}
                className="absolute left-0 top-1/2 h-px bg-ivory"
                initial={{ width: reduced || paused ? "100%" : "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: reduced || paused ? 0 : SLIDE_MS / 1000, ease: "linear" }}
              />
            )}
            {i < index && <span className="absolute inset-x-0 top-1/2 h-px bg-ivory/60" />}
          </button>
        ))}
      </div>
    </div>
  );
}

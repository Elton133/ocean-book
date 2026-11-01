"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Book } from "@/lib/types";
import { EASE_CINE, EASE_OUT } from "@/lib/motion";
import { zoneBySlug } from "@/lib/zones";
import type { Entry } from "./CreatureBook";

const pad = (n: number) => String(n).padStart(2, "0");

/** A two-digit counter whose digits roll like a mechanical display. */
function RollingNumber({ value }: { value: number }) {
  return (
    <span className="relative inline-flex overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE_CINE }}
          className="inline-block"
        >
          {pad(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** On picture-led spreads the chrome withdraws until the reader moves. */
function useIdle(enabled: boolean, ms = 2200) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let t = setTimeout(() => setIdle(true), ms);
    const wake = () => {
      setIdle(false);
      clearTimeout(t);
      t = setTimeout(() => setIdle(true), ms);
    };
    const events = ["pointermove", "pointerdown", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    return () => {
      clearTimeout(t);
      events.forEach((e) => window.removeEventListener(e, wake));
    };
  }, [enabled, ms]);
  return enabled && idle;
}

export function PageNavigation({
  book,
  entries,
  index,
  immersive,
  onPrev,
  onNext,
  onGoChapter,
  onClose,
  contentsOpen,
  setContentsOpen,
}: {
  book: Book;
  entries: Entry[];
  index: number;
  immersive: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoChapter: (ci: number) => void;
  onClose: () => void;
  contentsOpen: boolean;
  setContentsOpen: (v: boolean) => void;
}) {
  const entry = entries[index];
  const page = entry.page;
  const total = entries.length;
  const partsOf = (ci: number) => entries.filter((e) => e.ci === ci).length;
  const light = page.theme === "ivory" && !contentsOpen;
  const tone = light ? "text-ink" : "text-ivory";
  const hidden = useIdle(immersive && !contentsOpen);
  const zone = zoneBySlug(book.zone);
  const chromeFade = `transition-[opacity,color] duration-1000 ${hidden ? "opacity-0" : "opacity-100"}`;

  return (
    <>
      {/* Running head: title, creature, its zone; contents and exit */}
      <header className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-4 pt-4 sm:px-8 sm:pt-6 ${tone} ${chromeFade}`}>
        <div className="pointer-events-auto flex min-w-0 items-baseline gap-3">
          <Link href="/" className="eyebrow shrink-0 opacity-80 transition hover:opacity-100" data-no-drag>
            The Ocean Book
          </Link>
          <span className="eyebrow hidden opacity-40 sm:inline">/</span>
          <span className="display hidden truncate text-lg italic opacity-80 sm:inline">{book.creature.commonName}</span>
          <span className="annot hidden truncate uppercase tracking-[0.18em] opacity-45 md:inline">
            {zone.scientific} · {zone.from.toLocaleString("en-GB")}–{zone.to.toLocaleString("en-GB")} m
          </span>
        </div>
        <div className="pointer-events-auto flex items-center gap-5">
          <button type="button" onClick={() => setContentsOpen(!contentsOpen)} className="eyebrow opacity-80 transition hover:opacity-100" aria-expanded={contentsOpen}>
            {contentsOpen ? "Close" : "Contents"}
          </button>
          <button type="button" onClick={onClose} aria-label="Close book and return to the library" className="group relative grid h-9 w-9 place-items-center">
            <span className="absolute h-px w-5 rotate-45 bg-current transition group-hover:w-6" />
            <span className="absolute h-px w-5 -rotate-45 bg-current transition group-hover:w-6" />
          </button>
        </div>
      </header>

      {/* Foot of the page: chapter, progress, folio, arrows */}
      <nav aria-label="Book navigation" className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-8 sm:pb-6 ${tone} ${chromeFade}`}>
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={page.id}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.8, ease: EASE_OUT }}
                className="eyebrow truncate opacity-70"
              >
                <span className="opacity-60">Ch. {page.chapter} — </span>
                {page.title}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="pointer-events-auto flex shrink-0 items-center gap-3 sm:gap-5">
            <button type="button" onClick={onPrev} disabled={index === 0} aria-label="Previous page" className="group grid h-10 w-10 place-items-center transition disabled:opacity-20">
              <svg width="22" height="10" viewBox="0 0 22 10" className="transition-transform duration-500 group-hover:-translate-x-1">
                <path d="M21 5H1M5 1L1 5l4 4" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
            <button type="button" onClick={() => setContentsOpen(true)} className="annot flex items-baseline gap-1.5 text-sm" aria-label={`Page ${index + 1} of ${total}. Open contents`}>
              <RollingNumber value={index + 1} />
              <span className="opacity-40">/</span>
              <span className="opacity-60">{pad(total)}</span>
            </button>
            <button type="button" onClick={onNext} disabled={index === total - 1} aria-label="Next page" className="group grid h-10 w-10 place-items-center transition disabled:opacity-20">
              <svg width="22" height="10" viewBox="0 0 22 10" className="transition-transform duration-500 group-hover:translate-x-1">
                <path d="M1 5h20M17 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress: one segment per spread; split spreads fill in steps. */}
        <div className="pointer-events-auto mt-3 flex gap-1" role="group" aria-label="Chapters">
          {book.pages.map((p, ci) => {
            const fill = ci < entry.ci ? 1 : ci > entry.ci ? 0 : (entry.pi + 1) / partsOf(ci);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onGoChapter(ci)}
                aria-label={`Go to chapter ${p.chapter}: ${p.title}`}
                aria-current={ci === entry.ci ? "page" : undefined}
                className="group relative h-3 flex-1"
              >
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current opacity-20 transition group-hover:opacity-50" />
                <motion.span
                  className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current"
                  style={{ transformOrigin: "left" }}
                  initial={false}
                  animate={{ scaleX: fill }}
                  transition={{ duration: 0.9, ease: EASE_CINE, delay: ci === entry.ci ? 0.2 : 0 }}
                />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Contents */}
      <AnimatePresence>
        {contentsOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-abyss/95 text-ivory backdrop-blur-md"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(100% 0 0 0)" }}
            transition={{ duration: 0.9, ease: EASE_CINE }}
            data-no-drag
          >
            <div className="flex h-full flex-col px-6 pb-28 pt-20 sm:px-16 sm:pt-24">
              <p className="eyebrow mb-2 opacity-50">Contents</p>
              <h2 className="display mb-6 text-4xl italic sm:mb-10 sm:text-6xl">{book.creature.commonName}</h2>
              <ol className="grid min-h-0 flex-1 auto-rows-min content-start gap-x-12 sm:grid-cols-2">
                {book.pages.map((p, ci) => (
                  <motion.li key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + ci * 0.04, duration: 0.8, ease: EASE_OUT }}>
                    <button
                      type="button"
                      onClick={() => {
                        onGoChapter(ci);
                        setContentsOpen(false);
                      }}
                      className={`group flex w-full items-baseline gap-5 border-b hairline py-2.5 text-left transition sm:py-3.5 ${ci === entry.ci ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
                    >
                      <span className="annot w-8 shrink-0 opacity-60">{p.chapter}</span>
                      <span className="display text-2xl transition-transform duration-500 group-hover:translate-x-2 sm:text-4xl">{p.title}</span>
                    </button>
                  </motion.li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

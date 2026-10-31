"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Book } from "@/lib/types";
import { EASE_CINE, EASE_OUT } from "@/lib/motion";

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

export function PageNavigation({
  book,
  index,
  onPrev,
  onNext,
  onGo,
  onClose,
  contentsOpen,
  setContentsOpen,
}: {
  book: Book;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onGo: (i: number) => void;
  onClose: () => void;
  contentsOpen: boolean;
  setContentsOpen: (v: boolean) => void;
}) {
  const total = book.pages.length;
  const page = book.pages[index];
  const light = page.theme === "ivory" && !contentsOpen;
  const tone = light ? "text-ink" : "text-ivory";
  // On small screens spreads scroll beneath the chrome; a soft scrim keeps it legible.
  const scrim = light ? "from-ivory via-ivory/80" : "from-black/80 via-black/50";

  return (
    <>
      {/* Top: wordmark, creature, contents, exit */}
      <div aria-hidden className={`pointer-events-none fixed inset-x-0 top-0 z-40 h-20 bg-gradient-to-b ${scrim} to-transparent transition-opacity duration-700 lg:hidden`} />
      <div aria-hidden className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 h-32 bg-gradient-to-t ${scrim} to-transparent transition-opacity duration-700 lg:hidden`} />
      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-4 pt-4 transition-colors duration-700 sm:px-8 sm:pt-6 ${tone}`}
      >
        <div className="pointer-events-auto flex items-baseline gap-3">
          <Link href="/" className="eyebrow opacity-80 transition hover:opacity-100" data-no-drag>
            The Ocean Book
          </Link>
          <span className="eyebrow hidden opacity-40 sm:inline">/</span>
          <span className="display hidden text-lg italic opacity-80 sm:inline">{book.creature.commonName}</span>
        </div>
        <div className="pointer-events-auto flex items-center gap-5">
          <button
            type="button"
            onClick={() => setContentsOpen(!contentsOpen)}
            className="eyebrow opacity-80 transition hover:opacity-100"
            aria-expanded={contentsOpen}
          >
            {contentsOpen ? "Close contents" : "Contents"}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close book and return to the library"
            className="group relative grid h-9 w-9 place-items-center"
          >
            <span className="absolute h-px w-5 rotate-45 bg-current transition group-hover:w-6" />
            <span className="absolute h-px w-5 -rotate-45 bg-current transition group-hover:w-6" />
          </button>
        </div>
      </header>

      {/* Bottom: chapter title, progress, counter, arrows */}
      <nav
        aria-label="Book navigation"
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-4 transition-colors duration-700 sm:px-8 sm:pb-6 ${tone}`}
      >
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
            <button
              type="button"
              onClick={onPrev}
              disabled={index === 0}
              aria-label="Previous page"
              className="group grid h-10 w-10 place-items-center transition disabled:opacity-20"
            >
              <svg width="22" height="10" viewBox="0 0 22 10" className="transition-transform duration-500 group-hover:-translate-x-1">
                <path d="M21 5H1M5 1L1 5l4 4" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setContentsOpen(true)}
              className="annot flex items-baseline gap-1.5 text-sm"
              aria-label={`Page ${index + 1} of ${total}. Open contents`}
            >
              <RollingNumber value={index + 1} />
              <span className="opacity-40">/</span>
              <span className="opacity-60">{pad(total)}</span>
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={index === total - 1}
              aria-label="Next page"
              className="group grid h-10 w-10 place-items-center transition disabled:opacity-20"
            >
              <svg width="22" height="10" viewBox="0 0 22 10" className="transition-transform duration-500 group-hover:translate-x-1">
                <path d="M1 5h20M17 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress: one segment per chapter, clickable */}
        <div className="pointer-events-auto mt-3 flex gap-1" role="group" aria-label="Chapters">
          {book.pages.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onGo(i)}
              aria-label={`Go to chapter ${p.chapter}: ${p.title}`}
              aria-current={i === index ? "page" : undefined}
              className="group relative h-3 flex-1"
            >
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current opacity-20 transition group-hover:opacity-50" />
              <motion.span
                className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current"
                style={{ transformOrigin: "left" }}
                initial={false}
                animate={{ scaleX: i <= index ? 1 : 0 }}
                transition={{ duration: 0.9, ease: EASE_CINE, delay: i === index ? 0.2 : 0 }}
              />
            </button>
          ))}
        </div>
      </nav>

      {/* Contents overlay */}
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
            <div data-scroll className="no-scrollbar h-full overflow-y-auto px-6 pb-32 pt-24 sm:px-16">
              <p className="eyebrow mb-2 opacity-50">Contents</p>
              <h2 className="display mb-10 text-5xl italic sm:text-6xl">{book.creature.commonName}</h2>
              <ol className="grid gap-x-12 sm:grid-cols-2">
                {book.pages.map((p, i) => (
                  <motion.li
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.04, duration: 0.8, ease: EASE_OUT }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onGo(i);
                        setContentsOpen(false);
                      }}
                      className={`group flex w-full items-baseline gap-5 border-b hairline py-4 text-left transition ${i === index ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
                    >
                      <span className="annot w-8 shrink-0 opacity-60">{p.chapter}</span>
                      <span className="display text-3xl transition-transform duration-500 group-hover:translate-x-2 sm:text-4xl">{p.title}</span>
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

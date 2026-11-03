"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Creature, Film } from "@/lib/types";
import { EASE_CINE, EASE_OUT } from "@/lib/motion";

/** Lets any page of a book open the film sheet. */
export const FilmContext = createContext<{ film: Film | null; open: () => void }>({ film: null, open: () => {} });
export const useFilm = () => useContext(FilmContext);

/** A small play mark, drawn rather than an icon font. */
export const PlayMark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 12 12" aria-hidden className={className}>
    <path d="M3 1.8v8.4L10.2 6z" fill="currentColor" />
  </svg>
);

/**
 * The film, shown on request. The YouTube player loads only after the reader
 * presses play; until then it is a still from the film. Where no film has been
 * found, the sheet says so plainly and offers a search instead.
 */
export function FilmSheet({ creature, film, open, onClose }: { creature: Creature; film: Film | null; open: boolean; onClose: () => void }) {
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    return () => setPlaying(false);
  }, [open]);

  const watchUrl = film ? `https://www.youtube.com/watch?v=${film.youtubeId}` : null;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${creature.commonName} ${creature.scientificName}`)}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduced ? 0.15 : 0.35 } }}
          transition={{ duration: reduced ? 0.15 : 0.45 }}
          role="dialog"
          aria-modal="true"
          aria-label={film ? `Film: ${film.title}` : `No film yet of the ${creature.commonName}`}
          data-no-drag
        >
          <button type="button" aria-label="Close film" onClick={onClose} className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-md" />
          <motion.div
            className="relative w-full max-w-4xl text-ivory"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.35, ease: EASE_OUT } }}
            transition={{ duration: reduced ? 0.15 : 0.7, ease: EASE_CINE }}
          >
            <div className="mb-4 flex items-baseline justify-between gap-6">
              <p className="eyebrow opacity-60">{film ? "Watch" : "The film"}</p>
              <button ref={closeRef} type="button" onClick={onClose} className="eyebrow opacity-70 transition hover:opacity-100">
                Close
              </button>
            </div>

            {film ? (
              <>
                <div className="relative aspect-video overflow-hidden bg-black shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
                  {playing ? (
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${film.youtubeId}?autoplay=1&rel=0`}
                      title={film.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={`Play “${film.title}”`}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- a remote still from YouTube, shown only until play */}
                      <img src={`https://i.ytimg.com/vi/${film.youtubeId}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.02] group-hover:opacity-100" />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                      <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ivory/70 bg-black/30 backdrop-blur transition duration-500 group-hover:scale-110 group-hover:bg-ivory group-hover:text-abyss">
                        <PlayMark className="ml-1 h-6 w-6" />
                      </span>
                    </button>
                  )}
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <p className="display text-2xl leading-tight sm:text-3xl">{film.title}</p>
                    <p className="annot mt-2 text-[0.65rem] uppercase tracking-[0.16em] opacity-60">
                      {film.channel} · {film.kind}
                    </p>
                  </div>
                  <a href={watchUrl!} target="_blank" rel="noopener noreferrer" className="eyebrow inline-flex items-center gap-2 border-b border-ivory/50 pb-1 transition hover:border-ivory">
                    Open on YouTube <span aria-hidden>↗</span>
                  </a>
                </div>
                <p className="mt-6 max-w-2xl text-xs leading-relaxed opacity-50">
                  Films are made and hosted by the channels named, not by this book. They were chosen to show the {creature.commonName} itself; the book&apos;s facts rest on the references at its end.
                </p>
              </>
            ) : (
              <NoFilm creature={creature} searchUrl={searchUrl} reduced={!!reduced} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** An empty frame with a gentle explanation, rather than a dead link. */
function NoFilm({ creature, searchUrl, reduced }: { creature: Creature; searchUrl: string; reduced: boolean }) {
  return (
    <div className="relative overflow-hidden border border-ivory/15 bg-black/40 px-6 py-14 text-center sm:px-16 sm:py-20">
      {/* A film leader counting down to nothing */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.span
          className="h-[22rem] w-[22rem] rounded-full border border-ivory/10"
          animate={reduced ? undefined : { scale: [0.9, 1.05, 0.9], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.p
        className="display relative text-[clamp(2.4rem,6vw,4.5rem)] italic leading-none"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
      >
        No film yet
      </motion.p>
      <motion.p
        className="lede relative mx-auto mt-6 max-w-xl opacity-80"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease: EASE_OUT }}
      >
        We haven&apos;t found footage of the {creature.commonName} that we trust enough to show you. Many animals in this book live where cameras rarely reach — in deep water, in remote forest, or only at night — and some have been filmed alive just a handful of times.
      </motion.p>
      <motion.p
        className="relative mx-auto mt-4 max-w-xl text-sm opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        When a reliable film turns up, it will appear here. Until then, the photographs in this book are the closest look we can offer.
      </motion.p>
      <motion.a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="eyebrow relative mt-8 inline-flex items-center gap-2 border-b border-ivory/40 pb-1 transition hover:border-ivory"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.65 }}
      >
        Search YouTube yourself <span aria-hidden>↗</span>
      </motion.a>
    </div>
  );
}

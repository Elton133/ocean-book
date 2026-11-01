"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { MediaAsset } from "@/lib/types";
import type { PageProps } from "@/components/book/BookPage";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";
import { Reveal } from "@/components/motion/Reveal";
import { Credit, Ref } from "@/components/media/Media";
import { Action } from "@/components/ui/Controls";

export interface Cue {
  /** Seconds from the start of the clip. */
  t: number;
  text: string;
  ref?: number;
}

/**
 * Full-screen footage with narration set as captions, timed to the film.
 * Narration can also be spoken aloud by the browser.
 */
export function DocumentarySpread({ page }: PageProps) {
  const d = (page.data ?? {}) as { video: MediaAsset; cues: Cue[]; kicker?: string };
  const { active, reduced } = usePageMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cue, setCue] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speak, setSpeak] = useState(false);
  const canSpeak = useSyncExternalStore(
    () => () => {},
    () => "speechSynthesis" in window,
    () => false,
  );

  // Captions follow the film; if the film cannot play, they keep their own time.
  useEffect(() => {
    if (!active) return;
    const v = videoRef.current;
    if (v && !reduced) v.play().catch(() => {});
    const loop = (d.cues.at(-1)?.t ?? 0) + 7;
    const start = performance.now();
    const id = setInterval(() => {
      const film = videoRef.current;
      const t = film && !film.paused && film.readyState > 2 ? film.currentTime : ((performance.now() - start) / 1000) % loop;
      let i = 0;
      d.cues.forEach((c, k) => {
        if (t >= c.t) i = k;
      });
      setCue(i);
    }, 250);
    return () => clearInterval(id);
  }, [active, reduced, d.cues]);

  // Spoken narration, one cue at a time.
  useEffect(() => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    if (!speak || !active) return;
    const u = new SpeechSynthesisUtterance(d.cues[cue].text);
    u.rate = 0.92;
    u.pitch = 0.95;
    window.speechSynthesis.speak(u);
  }, [cue, speak, active, canSpeak, d.cues]);
  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const toggleFilm = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div className="absolute inset-0 bg-black">
      <motion.video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={active ? d.video.src : undefined}
        poster={d.video.poster}
        muted
        loop
        playsInline
        preload="auto"
        aria-label={d.video.alt}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: reduced ? 0.3 : 3, ease: EASE_OUT }}
      />
      {/* Letterbox and a soft floor for the captions */}
      <div className="absolute inset-x-0 top-0 h-[9vh] bg-black" />
      <div className="absolute inset-x-0 bottom-0 h-[9vh] bg-black" />
      <div className="absolute inset-x-0 bottom-[9vh] h-[45%] bg-gradient-to-t from-black/85 to-transparent" />

      <Reveal delay={0.4} className="absolute left-5 top-[11vh] sm:left-10 lg:left-16">
        <p className="eyebrow opacity-70">
          Chapter {page.chapter} — {page.title}
        </p>
        {d.kicker && <p className="display mt-1 text-lg italic opacity-60">{d.kicker}</p>}
      </Reveal>

      <div className="absolute inset-x-0 bottom-[24vh] flex justify-center px-6 sm:bottom-[17vh]">
        <AnimatePresence mode="wait">
          <motion.p
            key={cue}
            initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
            className="display max-w-3xl text-center text-[clamp(1.35rem,2.6vw,2.4rem)] italic leading-snug [text-shadow:0_2px_24px_rgba(0,0,0,0.8)]"
            aria-live="polite"
          >
            {d.cues[cue].text}
            <Ref n={d.cues[cue].ref} />
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-5 bottom-[11vh] flex flex-wrap items-end justify-between gap-3 sm:inset-x-10 lg:inset-x-16">
        <Credit media={d.video} className="max-w-md" />
        <div className="flex items-center gap-6">
          <Action onClick={toggleFilm}>{playing ? "Pause film" : "Play film"}</Action>
          {canSpeak && (
            <Action onClick={() => setSpeak((s) => !s)} pressed={speak}>
              {speak ? "Silence narration" : "Narrate aloud"}
            </Action>
          )}
        </div>
      </div>
    </div>
  );
}

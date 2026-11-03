"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { LandEntry, LibraryEntry, ShowcaseSlide } from "@/lib/catalogue";
import { LandShelf } from "./LandShelf";
import { AirShelf } from "./AirShelf";
import { FeaturedVolumes, WorldsTriptych, type FeaturedVolume, type World } from "./Featured";
import { SLIDE_MS, ShowcaseCaption, ShowcaseImages } from "./HeroShowcase";
import { EASE_OUT } from "@/lib/motion";
import { CreatureLibrary } from "./CreatureLibrary";


const ease = { duration: 1.4, ease: EASE_OUT };

/** Words that rise from a mask in sequence, like a title card. */
function TitleLine({ text, delay, className = "" }: { text: string; delay: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <span className={`block ${className}`} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reduced ? { opacity: 0 } : { y: "110%", rotate: 3 }}
            animate={reduced ? { opacity: 1 } : { y: "0%", rotate: 0 }}
            transition={{ ...ease, delay: delay + i * 0.08 }}
          >
            {w}
            {" "}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function Snow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 40 }, (_, i) => {
        const left = (i * 37) % 100;
        const size = 1 + ((i * 7) % 3);
        const dur = 14 + ((i * 13) % 16);
        return (
          <span
            key={i}
            className="absolute rounded-full bg-ivory/50 motion-safe:animate-[drift_linear_infinite]"
            style={{
              left: `${left}%`,
              top: "-2%",
              width: size,
              height: size,
              opacity: 0.2 + ((i * 11) % 6) / 10,
              animationDuration: `${dur}s`,
              animationDelay: `${-(i * 1.7) % dur}s`,
            }}
          />
        );
      })}
      <style>{`@keyframes drift { from { transform: translate3d(0,0,0); } to { transform: translate3d(20px,105vh,0); } }`}</style>
    </div>
  );
}

export function LandingPage({
  entries,
  land = [],
  slides,
  featured,
  worlds,
}: {
  entries: LibraryEntry[];
  land?: LandEntry[];
  slides: ShowcaseSlide[];
  featured: FeaturedVolume[];
  worlds: World[];
}) {
  const reduced = useReducedMotion();
  // The showcase moves on by itself unless the reader is looking at the caption or prefers stillness.
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduced || paused || slides.length < 2) return;
    const t = setTimeout(() => setSlide((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [slide, paused, reduced, slides.length]);
  const atSea = slides[slide]?.realm !== "land";
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  // Camera move: the hero image pushes in and sinks as you descend.
  const imgScale = useTransform(heroProgress, [0, 1], [1.05, reduced ? 1.05 : 1.3]);
  const imgY = useTransform(heroProgress, [0, 1], ["0%", reduced ? "0%" : "18%"]);
  const textY = useTransform(heroProgress, [0, 1], ["0%", reduced ? "0%" : "-40%"]);
  const textOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);


  return (
    <div className="relative">

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-5 mix-blend-difference sm:px-10 lg:px-16">
        <Link href="/" className="eyebrow text-ivory">The Wild Book</Link>
        <nav className="flex gap-4 sm:gap-6">
          <a href="#land" className="eyebrow hidden text-ivory/80 hover:text-ivory sm:inline">Land</a>
          <a href="#air" className="eyebrow hidden text-ivory/80 hover:text-ivory sm:inline">Air</a>
          <a href="#library" className="eyebrow text-ivory/80 hover:text-ivory">Sea</a>
          <Link href="/explore" className="eyebrow text-ivory/80 hover:text-ivory">Globe</Link>
          <a href="#about" className="eyebrow hidden text-ivory/80 hover:text-ivory lg:inline">About</a>
        </nav>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ scale: imgScale, y: imgY }}>
          {slides.length > 0 && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.12, filter: "blur(18px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: reduced ? 0.3 : 3.2, ease: EASE_OUT }}
            >
              <ShowcaseImages slides={slides} index={slide} reduced={!!reduced} />
            </motion.div>
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/60 to-abyss/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss via-transparent to-abyss/50" />
        {/* Warm daylight on land */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(80% 60% at 80% 0%, rgba(240,200,130,0.16), transparent 65%)" }}
          animate={{ opacity: atSea ? 0 : 1 }}
          transition={{ duration: 1.5 }}
        />
        {/* Light shafts and marine snow: only when the animal on screen lives at sea */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" animate={{ opacity: atSea ? 1 : 0 }} transition={{ duration: 1.5 }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-screen">
          {[18, 42, 66].map((l, i) => (
            <motion.div
              key={l}
              className="absolute -top-1/4 h-[150%] w-[10%] origin-top blur-3xl"
              style={{ left: `${l}%`, rotate: 14 + i * 3, background: "linear-gradient(180deg, rgba(190,240,235,0.16), transparent 70%)" }}
              animate={reduced ? undefined : { opacity: [0.3, 1, 0.4], rotate: [14 + i * 3, 18 + i * 3, 14 + i * 3] }}
              transition={{ duration: 10 + i * 3, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
        <Snow />
        </motion.div>

        <motion.div className="relative z-10 flex h-full flex-col justify-end px-5 pb-20 sm:px-10 md:pl-24 lg:px-16 lg:pb-24 lg:pl-28" style={{ y: textY, opacity: textOpacity }}>
          <motion.p className="eyebrow opacity-70" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 0.7, x: 0 }} transition={{ ...ease, delay: 0.4 }}>
            A visual natural history · {entries.length + land.length} species, on land and at sea
          </motion.p>
          <h1 className="display mt-5 text-[clamp(3.4rem,10vw,10.5rem)] leading-[0.86]">
            <TitleLine text="Wild lives," delay={0.6} />
            <TitleLine text="from forest to abyss" delay={0.85} className="italic text-[#bfe9e2]" />
          </h1>
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <motion.p className="lede max-w-lg opacity-85" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.85, y: 0 }} transition={{ ...ease, delay: 1.5 }}>
              An illustrated library of the world&apos;s most extraordinary animals — rainforest, desert, savanna and the deep sea — told through photography, motion and interactive diagrams, with every fact sourced and every image credited.
            </motion.p>
            <motion.div className="flex flex-wrap items-center gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...ease, delay: 1.8 }}>
              <Link href="/explore" className="group relative inline-flex items-center gap-4 overflow-hidden border border-ivory/60 px-6 py-4">
                <span className="absolute inset-0 origin-left scale-x-0 bg-ivory transition-transform duration-700 ease-[cubic-bezier(0.83,0,0.17,1)] group-hover:scale-x-100" />
                <span className="eyebrow relative transition-colors duration-700 group-hover:text-abyss">Explore the world</span>
                <svg width="26" height="10" viewBox="0 0 26 10" className="relative transition-all duration-700 group-hover:translate-x-1 group-hover:text-abyss">
                  <path d="M0 5h24M20 1l4 4-4 4" fill="none" stroke="currentColor" />
                </svg>
              </Link>
              <a href="#library" className="eyebrow opacity-70 transition hover:opacity-100">
                Ocean library ↓
              </a>
              {land.length > 0 && (
                <a href="#land" className="eyebrow opacity-70 transition hover:opacity-100">
                  Life on land ↓
                </a>
              )}
              {land.some((e) => e.flight) && (
                <a href="#air" className="eyebrow opacity-70 transition hover:opacity-100">
                  In the air ↓
                </a>
              )}
            </motion.div>
          </div>
        </motion.div>

        {slides.length > 0 && (
          <motion.div
            className="absolute right-5 top-20 z-10 max-w-[18rem] sm:top-24 lg:right-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...ease, delay: 2.2 }}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <ShowcaseCaption slides={slides} index={slide} reduced={!!reduced} paused={paused} onPick={setSlide} />
          </motion.div>
        )}

        <motion.div
          aria-hidden
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2.6 }}
        >
          <span className="annot uppercase tracking-[0.25em]">Descend</span>
          <motion.span className="block h-10 w-px origin-top bg-ivory" animate={reduced ? undefined : { scaleY: [0, 1, 0], y: [0, 0, 20] }} transition={{ duration: 2.2, repeat: Infinity }} />
        </motion.div>
      </section>

      <WorldsTriptych worlds={worlds} />

      <FeaturedVolumes volumes={featured} />

      {land.length > 0 && <LandShelf entries={land} />}
      <AirShelf entries={land} />

      <CreatureLibrary entries={entries} />

      {/* About */}
      <footer id="about" className="relative z-10 border-t border-ivory/10 px-5 py-24 sm:px-10 md:pl-24 lg:px-16 lg:pl-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow opacity-60">About this book</p>
            <p className="display mt-4 text-4xl leading-tight">
              Wonder is no excuse for <i>inaccuracy</i>.
            </p>
          </div>
          <div className="grid gap-8 text-sm leading-relaxed opacity-75 sm:grid-cols-2 lg:col-span-7">
            <p>
              Facts are drawn from scientific institutions and peer-reviewed literature — IUCN, WoRMS, GBIF, MBARI, NOAA, Cornell Lab, natural history museums, public aquaria and journals — and each is cited. Statements are marked as <b>established</b>, a <b>hypothesis</b>, or <b>uncertain</b>.
            </p>
            <p>
              Photographs and film are openly licensed (public domain, CC0, CC BY and CC BY-SA), mostly via Wikimedia Commons, with creator, licence and source shown beside each image and collected at the end of every book. Images are matched to species; where no verified image exists, none is shown. Diagrams marked illustrative are teaching models, not measurements.
            </p>
          </div>
        </div>
        <p className="annot mt-16 opacity-40">The Wild Book · Land, Air and Sea</p>
      </footer>
    </div>
  );
}

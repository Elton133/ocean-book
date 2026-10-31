"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import type { LibraryEntry } from "@/lib/catalogue";
import { EASE_OUT } from "@/lib/motion";
import { CreatureLibrary, markFromLibrary } from "./CreatureLibrary";

interface Featured {
  creature: LibraryEntry;
  chapters: { chapter: string; title: string }[];
  summary: string;
}

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

export function OceanLandingPage({ entries, featured }: { entries: LibraryEntry[]; featured: Featured }) {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  // Camera move: the hero image pushes in and sinks as you descend.
  const imgScale = useTransform(heroProgress, [0, 1], [1.05, reduced ? 1.05 : 1.3]);
  const imgY = useTransform(heroProgress, [0, 1], ["0%", reduced ? "0%" : "18%"]);
  const textY = useTransform(heroProgress, [0, 1], ["0%", reduced ? "0%" : "-40%"]);
  const textOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);

  // A depth meter that reads deeper as the page scrolls.
  const [depth, setDepth] = useState(0);
  useMotionValueEvent(smooth, "change", (v) => setDepth(Math.round(v * 4000)));
  const bgTint = useTransform(smooth, [0, 1], ["rgba(12,43,47,0.55)", "rgba(0,0,0,0)"]);
  const meterHeight = useTransform(smooth, [0, 1], ["0%", "100%"]);

  const octo = featured.creature;

  return (
    <div className="relative">
      <motion.div aria-hidden className="pointer-events-none fixed inset-0 -z-0" style={{ background: bgTint }} />

      {/* Depth meter */}
      <div className="pointer-events-none fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex lg:left-8">
        <span className="annot opacity-50 [writing-mode:vertical-rl]">Depth</span>
        <div className="relative h-40 w-px bg-ivory/20">
          <motion.span className="absolute left-0 top-0 w-px bg-biolume" style={{ height: meterHeight }} />
        </div>
        <span className="annot tabular-nums opacity-80">{depth.toLocaleString("en-GB")} m</span>
      </div>

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-5 mix-blend-difference sm:px-10 lg:px-16">
        <Link href="/" className="eyebrow text-ivory">The Ocean Book</Link>
        <nav className="flex gap-6">
          <a href="#featured" className="eyebrow hidden text-ivory/80 hover:text-ivory sm:inline">Featured</a>
          <a href="#library" className="eyebrow text-ivory/80 hover:text-ivory">Library</a>
          <a href="#about" className="eyebrow hidden text-ivory/80 hover:text-ivory sm:inline">About</a>
        </nav>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ scale: imgScale, y: imgY }}>
          {octo.image && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.12, filter: "blur(18px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: reduced ? 0.3 : 3.2, ease: EASE_OUT }}
            >
              <Image src={octo.image.src} alt={octo.image.alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "60% 45%" }} />
            </motion.div>
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/60 to-abyss/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss via-transparent to-abyss/50" />
        {/* light shafts */}
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

        <motion.div className="relative z-10 flex h-full flex-col justify-end px-5 pb-20 sm:px-10 md:pl-24 lg:px-16 lg:pb-24 lg:pl-28" style={{ y: textY, opacity: textOpacity }}>
          <motion.p className="eyebrow opacity-70" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 0.7, x: 0 }} transition={{ ...ease, delay: 0.4 }}>
            A visual natural history · Volume I · {entries.length} creatures
          </motion.p>
          <h1 className="display mt-5 text-[clamp(3.4rem,10vw,10.5rem)] leading-[0.86]">
            <TitleLine text="Strange lives" delay={0.6} />
            <TitleLine text="beneath the surface" delay={0.85} className="italic text-[#bfe9e2]" />
          </h1>
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <motion.p className="lede max-w-lg opacity-85" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.85, y: 0 }} transition={{ ...ease, delay: 1.5 }}>
              An illustrated library of the ocean&apos;s most extraordinary animals — told through photography, motion and interactive diagrams, with every fact sourced and every image credited.
            </motion.p>
            <motion.div className="flex flex-wrap items-center gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...ease, delay: 1.8 }}>
              <Link
                href={`/creatures/${octo.slug}`}
                onClick={markFromLibrary}
                className="group relative inline-flex items-center gap-4 overflow-hidden border border-ivory/60 px-6 py-4"
              >
                <span className="absolute inset-0 origin-left scale-x-0 bg-ivory transition-transform duration-700 ease-[cubic-bezier(0.83,0,0.17,1)] group-hover:scale-x-100" />
                <span className="eyebrow relative transition-colors duration-700 group-hover:text-abyss">Open the first book</span>
                <svg width="26" height="10" viewBox="0 0 26 10" className="relative transition-all duration-700 group-hover:translate-x-1 group-hover:text-abyss">
                  <path d="M0 5h24M20 1l4 4-4 4" fill="none" stroke="currentColor" />
                </svg>
              </Link>
              <a href="#library" className="eyebrow opacity-70 transition hover:opacity-100">
                Explore the library ↓
              </a>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="absolute right-5 top-24 z-10 hidden max-w-[16rem] text-right sm:block lg:right-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...ease, delay: 2.2 }}
        >
          <p className="annot uppercase tracking-[0.2em] opacity-60">Featured</p>
          <p className="display mt-1 text-2xl italic">{octo.commonName}</p>
          <p className="annot opacity-60">{octo.scientificName}</p>
        </motion.div>

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

      {/* Featured volume */}
      <section id="featured" className="relative z-10 px-5 py-28 sm:px-10 md:pl-24 lg:px-16 lg:pl-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={ease}
          >
            <p className="eyebrow opacity-60">The featured volume</p>
            <h2 className="display mt-4 text-[clamp(2.8rem,6vw,6rem)]">
              {octo.commonName.split(" ").slice(0, -1).join(" ")} <i className="text-[#f3c9b4]">{octo.commonName.split(" ").slice(-1)}</i>
            </h2>
            <p className="lede mt-6 max-w-md opacity-80">{featured.summary}</p>
            <Link href={`/creatures/${octo.slug}`} onClick={markFromLibrary} className="eyebrow mt-8 inline-flex items-center gap-3 border-b border-ivory/40 pb-1 transition hover:border-ivory">
              Begin reading <span aria-hidden>→</span>
            </Link>
          </motion.div>
          <ol className="lg:col-span-7">
            {featured.chapters.map((ch, i) => (
              <motion.li
                key={ch.chapter}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ ...ease, delay: i * 0.05 }}
              >
                <Link
                  href={`/creatures/${octo.slug}#${i + 1}`}
                  onClick={markFromLibrary}
                  className="group flex items-baseline gap-6 border-b border-ivory/12 py-4 transition-colors hover:border-ivory/50"
                >
                  <span className="annot w-8 opacity-50">{ch.chapter}</span>
                  <span className="display text-[clamp(1.6rem,3vw,2.6rem)] leading-tight transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 group-hover:italic">
                    {ch.title}
                  </span>
                  <span className="ml-auto opacity-0 transition duration-500 group-hover:opacity-70">→</span>
                </Link>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

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
              Facts are drawn from scientific institutions and peer-reviewed literature — WoRMS, MBARI, NOAA, natural history museums, public aquaria and journals — and each is cited. Statements are marked as <b>established</b>, a <b>hypothesis</b>, or <b>uncertain</b>.
            </p>
            <p>
              Photographs and film are openly licensed (public domain, CC0, CC BY and CC BY-SA), mostly via Wikimedia Commons, with creator, licence and source shown beside each image and collected at the end of every book. Images are matched to species; where no verified image exists, none is shown. Diagrams marked illustrative are teaching models, not measurements.
            </p>
          </div>
        </div>
        <p className="annot mt-16 opacity-40">The Ocean Book · Volume I</p>
      </footer>
    </div>
  );
}

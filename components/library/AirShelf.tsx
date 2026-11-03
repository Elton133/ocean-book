"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LandEntry } from "@/lib/catalogue";
import { FLIGHT_STYLES } from "@/lib/flight";
import { EASE_OUT } from "@/lib/motion";
import { VolumeGrid } from "./LandShelf";

/* A few birds crossing the sky behind the title: simple chevrons on slow, staggered paths. */
function Flock({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] overflow-hidden">
      {Array.from({ length: 9 }, (_, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 20 8"
          className="absolute w-5 text-ivory/40"
          style={{ top: `${12 + ((i * 37) % 60)}%` }}
          initial={{ left: "-5%" }}
          animate={{ left: "105%", y: [0, -10, 4, 0] }}
          transition={{ duration: 28 + ((i * 7) % 14), delay: -i * 4, repeat: Infinity, ease: "linear" }}
        >
          <motion.path
            d="M0 6 Q5 0 10 5 Q15 0 20 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            animate={{ d: ["M0 6 Q5 0 10 5 Q15 0 20 6", "M0 3 Q5 6 10 5 Q15 6 20 3", "M0 6 Q5 0 10 5 Q15 0 20 6"] }}
            transition={{ duration: 0.9 + (i % 3) * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>
      ))}
    </div>
  );
}

/** Masters of the Air: every animal that flies, shelved by how it flies. */
export function AirShelf({ entries }: { entries: LandEntry[] }) {
  const reduced = !!useReducedMotion();
  const ease = { duration: reduced ? 0.3 : 1.1, ease: EASE_OUT };
  const fliers = entries.filter((e) => e.flight);
  if (!fliers.length) return null;
  const groups = FLIGHT_STYLES.map((f) => ({ style: f, items: fliers.filter((e) => e.flight === f.slug) })).filter((g) => g.items.length);

  return (
    <section id="air" className="relative z-10 overflow-hidden px-5 py-28 sm:px-10 md:pl-24 lg:px-16 lg:pl-28" style={{ background: "linear-gradient(180deg, #1d180b 0%, #13263a 22%, #0c1a2b 100%)" }}>
      <Flock reduced={reduced} />
      <motion.div className="relative max-w-3xl" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-15%" }} transition={ease}>
        <p className="eyebrow opacity-60">Volume III · Into the sky</p>
        <h2 className="display mt-4 text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.92]">
          Masters of the <i className="text-[#bcd6ee]">air</i>
        </h2>
        <p className="lede mt-6 max-w-md opacity-80">
          Feathers, skin and chitin: {fliers.length} animals that soar, dive, hover and hunt by sound — shelved by the way they fly.
        </p>
      </motion.div>

      {groups.map(({ style, items }) => (
        <div key={style.slug} className="relative mt-20">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-ivory/12 pb-3">
            <h3 className="display text-3xl italic">{style.title}</h3>
            <span className="annot opacity-50">{items.length}</span>
            <p className="w-full text-sm opacity-60 sm:ml-auto sm:w-auto">{style.line}</p>
          </div>
          <VolumeGrid items={items} />
        </div>
      ))}
    </section>
  );
}

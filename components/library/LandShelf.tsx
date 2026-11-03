"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { LandEntry } from "@/lib/catalogue";
import { BIOMES, REGIONS, regionBySlug } from "@/lib/world";
import { EASE_OUT } from "@/lib/motion";
import { MiniGlobe } from "@/components/pages/RangeSpread";
import { markFromLibrary } from "./CreatureLibrary";

const LAND_REGIONS = REGIONS.filter((r) => r.realm === "land").map((r) => r.slug);

/** Back up from the trenches and onto land: the land volumes by habitat, and the way into the globe. */
export function LandShelf({ entries }: { entries: LandEntry[] }) {
  const reduced = useReducedMotion();
  const ease = { duration: reduced ? 0.3 : 1.1, ease: EASE_OUT };
  // Fliers have a shelf of their own in the sky, below.
  const walkers = entries.filter((e) => !e.flight);
  const groups = BIOMES.map((b) => ({ biome: b, items: walkers.filter((e) => e.biome === b.slug) })).filter((g) => g.items.length);

  return (
    <section id="land" className="relative z-10 overflow-hidden px-5 py-28 sm:px-10 md:pl-24 lg:px-16 lg:pl-28" style={{ background: "linear-gradient(180deg, #000 0%, #0b1d15 18%, #1d180b 100%)" }}>
      {/* The way into the globe */}
      <div className="grid items-center gap-12 lg:grid-cols-12">
        <motion.div className="lg:col-span-6" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-15%" }} transition={ease}>
          <p className="eyebrow opacity-60">Volume II · Beyond the shore</p>
          <h2 className="display mt-4 text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.92]">
            The <i className="text-[#e7cf98]">living</i> world
          </h2>
          <p className="lede mt-6 max-w-md opacity-80">
            Rainforest, desert, savanna and ice. Turn the globe, tap a region, and meet the animals that live there — {LAND_REGIONS.length} regions on land, five oceans at sea.
          </p>
          <Link href="/explore" className="group relative mt-8 inline-flex items-center gap-4 overflow-hidden border border-ivory/60 px-6 py-4">
            <span className="absolute inset-0 origin-left scale-x-0 bg-ivory transition-transform duration-700 ease-[cubic-bezier(0.83,0,0.17,1)] group-hover:scale-x-100" />
            <span className="eyebrow relative transition-colors duration-700 group-hover:text-abyss">Explore the world</span>
            <svg width="26" height="10" viewBox="0 0 26 10" className="relative transition-all duration-700 group-hover:translate-x-1 group-hover:text-abyss">
              <path d="M0 5h24M20 1l4 4-4 4" fill="none" stroke="currentColor" />
            </svg>
          </Link>
        </motion.div>
        <motion.div className="flex justify-center lg:col-span-6" initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-10%" }} transition={{ ...ease, duration: reduced ? 0.3 : 1.6 }}>
          <Link href="/explore" aria-label="Open the globe" className="block w-full max-w-md">
            <MiniGlobe regions={LAND_REGIONS} colour="#c9a548" />
          </Link>
        </motion.div>
      </div>

      {/* Land volumes, shelved by habitat */}
      {groups.map(({ biome, items }) => (
        <div key={biome.slug} className="mt-24">
          <div className="flex items-baseline gap-3 border-b border-ivory/12 pb-3">
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: biome.colour }} />
            <h3 className="display text-3xl italic">{biome.name}</h3>
            <span className="annot opacity-50">{items.length}</span>
          </div>
          <VolumeGrid items={items} />
        </div>
      ))}
    </section>
  );
}

/** Land volumes as photographs with name, Latin name and tagline, rising in as they scroll into view. */
export function VolumeGrid({ items }: { items: LandEntry[] }) {
  const reduced = useReducedMotion();
  const ease = { duration: reduced ? 0.3 : 1.1, ease: EASE_OUT };
  return (
    <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((e, i) => (
        <motion.li key={e.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ ...ease, delay: i * 0.06 }}>
          <Link href={`/creatures/${e.slug}`} onClick={markFromLibrary} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-deep">
              {e.image && (
                <Image
                  src={e.image.src}
                  alt={e.image.alt}
                  fill
                  sizes="(min-width:1024px) 22vw, 45vw"
                  className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                  style={{ objectPosition: e.image.focal }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="annot absolute bottom-3 left-3 text-[0.55rem] uppercase tracking-[0.16em] opacity-80">{regionBySlug(e.regions[0])?.name}</span>
            </div>
            <p className="display mt-3 text-2xl leading-tight transition group-hover:italic">{e.commonName}</p>
            <p className="text-sm italic opacity-60">{e.scientificName}</p>
            <p className="mt-1 text-sm opacity-75">{e.tagline}</p>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}

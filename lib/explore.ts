import index from "@/data/species-index.json";
import { creatures } from "./catalogue";
import type { BiomeSlug, CategorySlug, Realm, RegionSlug } from "./types";
import { biomeBySlug, REGIONS, regionsOf, type Region } from "./world";

/** A row of data/species-index.json: every species shown on the globe, documented or not. */
interface IndexEntry {
  slug: string;
  commonName: string;
  scientificName: string;
  region: RegionSlug;
  biome: BiomeSlug;
  pin: [number, number];
  thumb: { src: string; width: number; height: number; alt: string; creator?: string; license?: string } | null;
}

export interface RegionAnimal {
  slug: string;
  commonName: string;
  scientificName: string;
  realm: Realm;
  biome: BiomeSlug;
  /** Representative locality for the region map; null where none is recorded. */
  pin: [number, number] | null;
  thumb: { src: string; width: number; height: number; alt: string; credit?: string } | null;
  /** True when a full book exists at /creatures/[slug]. */
  documented: boolean;
  categories: CategorySlug[];
}

export interface RegionCard extends Region {
  colour: string;
  biomeName: string;
  animals: RegionAnimal[];
}

const INDEX = index as IndexEntry[];

const rank = (a: RegionAnimal) => (a.documented ? 0 : 2) + (a.thumb ? 0 : 1);

function animalsIn(slug: RegionSlug): RegionAnimal[] {
  const out = new Map<string, RegionAnimal>();
  for (const e of INDEX.filter((e) => e.region === slug)) {
    const c = creatures.find((c) => c.slug === e.slug);
    out.set(e.slug, {
      slug: e.slug,
      commonName: c?.commonName ?? e.commonName,
      scientificName: c?.scientificName ?? e.scientificName,
      realm: c?.realm ?? "land",
      biome: c?.realm === "land" ? c.biome : e.biome,
      pin: e.pin,
      thumb: c?.image
        ? { src: c.image.src, width: c.image.width, height: c.image.height, alt: c.image.alt }
        : e.thumb && { src: e.thumb.src, width: e.thumb.width, height: e.thumb.height, alt: e.thumb.alt, credit: [e.thumb.creator, e.thumb.license].filter(Boolean).join(" · ") },
      documented: !!c,
      categories: c?.categories ?? [],
    });
  }
  // Documented animals whose range also reaches this region, and every sea creature.
  for (const c of creatures) {
    if (out.has(c.slug) || !regionsOf(c).includes(slug)) continue;
    out.set(c.slug, {
      slug: c.slug,
      commonName: c.commonName,
      scientificName: c.scientificName,
      realm: c.realm,
      biome: c.realm === "land" ? c.biome : "ocean",
      pin: null,
      thumb: c.image && { src: c.image.src, width: c.image.width, height: c.image.height, alt: c.image.alt },
      documented: true,
      categories: c.categories,
    });
  }
  return [...out.values()].sort((a, b) => rank(a) - rank(b) || a.commonName.localeCompare(b.commonName));
}

/** Every region with its animals, ready to send to the globe. */
export function regionCards(): RegionCard[] {
  return REGIONS.map((r) => {
    const b = biomeBySlug(r.biome);
    return { ...r, colour: b.colour, biomeName: b.name, animals: animalsIn(r.slug) };
  });
}

export const regionCard = (slug: string) => regionCards().find((r) => r.slug === slug);

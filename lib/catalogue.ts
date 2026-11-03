import raw from "@/data/catalogue.generated.json";
import { octopus, octopusPages } from "@/data/books/giant-pacific-octopus";
import films from "@/data/films.json";
import type { Book, Creature, Film, LandCreature, MediaAsset, OceanCreature, PageSpec, RegionSlug } from "./types";
import { buildDefaultPages } from "./book-builder";
import { zoneBySlug, zoneOf, type ZoneSlug } from "./zones";
import { oceanRegionsOf, regionBySlug } from "./world";

/** Hand-authored books take precedence over the generated default layout. */
const AUTHORED: Record<string, { creature: Creature; pages: PageSpec[] }> = {
  [octopus.slug]: { creature: octopus, pages: octopusPages },
};

const generated = (raw as unknown as Creature[]).filter((c) => !AUTHORED[c.slug]);

export const creatures: Creature[] = [
  ...Object.values(AUTHORED).map((a) => a.creature),
  ...generated.sort((a, b) => a.commonName.localeCompare(b.commonName)),
];

export function getCreature(slug: string) {
  return creatures.find((c) => c.slug === slug);
}

const RELATED_BY_SLUG: Record<string, string[]> = {
  "giant-pacific-octopus": ["mimic-octopus", "blue-ringed-octopus", "dumbo-octopus", "blanket-octopus", "glass-octopus"],
};

function relatedFor(creature: Creature) {
  const curated = (RELATED_BY_SLUG[creature.slug] ?? []).map(getCreature).filter(Boolean) as Creature[];
  const scored = creatures
    .filter((c) => c.slug !== creature.slug && c.realm === creature.realm && !curated.includes(c))
    .map((c) => ({
      c,
      score:
        c.categories.filter((k) => creature.categories.includes(k)).length * 2 +
        (c.taxonomy.class === creature.taxonomy.class ? 3 : 0) +
        (c.image ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.c);
  return [...curated, ...scored].slice(0, 4).map(({ slug, commonName, scientificName, image }) => ({ slug, commonName, scientificName, image }));
}

export function getBook(slug: string): Book | undefined {
  const authored = AUTHORED[slug];
  const creature = authored?.creature ?? getCreature(slug);
  if (!creature) return undefined;
  return {
    creature,
    film: (films as Record<string, Film | null>)[slug] ?? null,
    zone: creature.realm === "ocean" ? zoneOf(creature) : null,
    pages: authored?.pages ?? buildDefaultPages(creature),
    related: relatedFor(creature),
  };
}

/** One slide of the landing-page showcase. */
export interface ShowcaseSlide {
  slug: string;
  commonName: string;
  scientificName: string;
  realm: Creature["realm"];
  /** Where it lives: a region on land, a depth zone at sea. */
  place: string;
  image: MediaAsset;
}

/** Animals for the landing page, in the order given, skipping any without a photograph. */
export function showcase(slugs: string[]): ShowcaseSlide[] {
  return slugs
    .map(getCreature)
    .filter((c): c is Creature & { image: MediaAsset } => !!c?.image)
    .map((c) => ({
      slug: c.slug,
      commonName: c.commonName,
      scientificName: c.scientificName,
      realm: c.realm,
      place: c.realm === "land" ? (regionBySlug(c.regions[0])?.name ?? "") : zoneBySlug(zoneOf(c)).name,
      image: c.image,
    }));
}

/** Land volumes for the landing page, grouped by habitat on the client. */
export type LandEntry = Pick<LandCreature, "slug" | "commonName" | "scientificName" | "biome" | "regions" | "categories" | "tagline" | "image" | "flight">;

export function landIndex(): LandEntry[] {
  return creatures
    .filter((c): c is LandCreature => c.realm === "land")
    .map(({ slug, commonName, scientificName, biome, regions, categories, tagline, image, flight }) => ({
      slug,
      commonName,
      scientificName,
      biome,
      regions,
      categories,
      tagline,
      image,
      ...(flight ? { flight } : {}),
    }));
}

/** Lightweight records for the ocean library and search, safe to send to the client. */
export type LibraryEntry = Pick<
  OceanCreature,
  "slug" | "commonName" | "scientificName" | "group" | "categories" | "tagline" | "ability" | "taxonomy" | "image" | "depthRange"
> & { pageCount: number; zone: ZoneSlug; oceans: RegionSlug[] };

export function libraryIndex(): LibraryEntry[] {
  return creatures.filter((c): c is OceanCreature => c.realm === "ocean").map((c) => ({
    slug: c.slug,
    commonName: c.commonName,
    scientificName: c.scientificName,
    group: c.group,
    categories: c.categories,
    tagline: c.tagline,
    ability: c.ability,
    taxonomy: c.taxonomy,
    image: c.image,
    depthRange: c.depthRange,
    zone: zoneOf(c),
    oceans: oceanRegionsOf(c),
    pageCount: (AUTHORED[c.slug]?.pages ?? buildDefaultPages(c)).length,
  }));
}

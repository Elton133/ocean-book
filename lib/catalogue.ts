import raw from "@/data/catalogue.generated.json";
import { octopus, octopusPages } from "@/data/books/giant-pacific-octopus";
import type { Book, Creature, PageSpec } from "./types";
import { buildDefaultPages } from "./book-builder";
import { zoneOf, type ZoneSlug } from "./zones";

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
    .filter((c) => c.slug !== creature.slug && !curated.includes(c))
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
    zone: zoneOf(creature),
    pages: authored?.pages ?? buildDefaultPages(creature),
    related: relatedFor(creature),
  };
}

/** Lightweight records for the library and search, safe to send to the client. */
export type LibraryEntry = Pick<
  Creature,
  "slug" | "commonName" | "scientificName" | "group" | "categories" | "tagline" | "ability" | "taxonomy" | "image" | "depthRange"
> & { pageCount: number; zone: ZoneSlug };

export function libraryIndex(): LibraryEntry[] {
  return creatures.map((c) => ({
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
    pageCount: (AUTHORED[c.slug]?.pages ?? buildDefaultPages(c)).length,
  }));
}

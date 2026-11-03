import type { OceanCreature } from "./types";

export type ZoneSlug = "surface" | "twilight" | "midnight" | "abyssal" | "hadal";

export interface Zone {
  slug: ZoneSlug;
  name: string;
  scientific: string;
  from: number;
  to: number;
  line: string;
  /** Water colour at the top and bottom of the zone, used for the descent. */
  water: [string, string];
}

export const ZONES: Zone[] = [
  { slug: "surface", name: "The Sunlit Surface", scientific: "Epipelagic", from: 0, to: 200, line: "Bright water, sunlight and reefs — where light still powers the food web.", water: ["#0e6c9a", "#0b4a73"] },
  { slug: "twilight", name: "The Twilight Zone", scientific: "Mesopelagic", from: 200, to: 1000, line: "Fading blue light and strange silhouettes. Many animals here make their own light.", water: ["#0b3a5c", "#061c33"] },
  { slug: "midnight", name: "The Midnight Zone", scientific: "Bathypelagic", from: 1000, to: 4000, line: "No sunlight at all. The only light is living light.", water: ["#040d1a", "#02060c"] },
  { slug: "abyssal", name: "The Abyss", scientific: "Abyssopelagic", from: 4000, to: 6000, line: "Near-freezing, crushing and dark: the great plains of the deep seafloor.", water: ["#020409", "#010205"] },
  { slug: "hadal", name: "The Trenches", scientific: "Hadal", from: 6000, to: 11000, line: "The deepest places on Earth. Few animals have ever been seen here.", water: ["#010203", "#000000"] },
];

/*
 * Placement where the depth range alone would mislead: sea pigs are animals
 * of the abyssal plains; the dumbo octopus holds the cephalopod depth record
 * in the hadal zone; the cookiecutter shark spends its days at depth.
 */
const OVERRIDES: Record<string, ZoneSlug> = {
  "sea-pig": "abyssal",
  "dumbo-octopus": "hadal",
  "cookiecutter-shark": "twilight",
};

/** Representative depth: geometric mean of the range, which favours where an animal is usually found. */
export function zoneOf(c: Pick<OceanCreature, "slug" | "depthRange">): ZoneSlug {
  if (OVERRIDES[c.slug]) return OVERRIDES[c.slug];
  const rep = Math.sqrt((c.depthRange.min + 1) * (c.depthRange.max + 1));
  return (ZONES.find((z) => rep < z.to) ?? ZONES[ZONES.length - 1]).slug;
}

export const zoneBySlug = (s: ZoneSlug) => ZONES.find((z) => z.slug === s)!;

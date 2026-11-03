import world from "@/data/world.json";
import type { BiomeSlug, Creature, OceanCreature, Realm, RegionSlug } from "./types";

export interface Biome {
  slug: BiomeSlug;
  name: string;
  /** Tint for the biome on the globe and in the book chrome. */
  colour: string;
}

export interface Region {
  slug: RegionSlug;
  name: string;
  realm: Realm;
  biome: BiomeSlug;
  /** [longitude, latitude] the globe turns to when the region is chosen. */
  centroid: [number, number];
  line: string;
}

/* Shared with scripts/build-catalogue.mjs, which validates records against the same lists. */
export const BIOMES = world.biomes as Biome[];
export const REGIONS = world.regions as Region[];

export const biomeBySlug = (s: BiomeSlug) => BIOMES.find((b) => b.slug === s)!;
export const regionBySlug = (s: string) => REGIONS.find((r) => r.slug === s);

/* Longitude of the Americas' Pacific coast by latitude: west of it is Pacific. */
const PACIFIC_COAST: [number, number][] = [[-56, -68], [-40, -74], [-20, -71], [-5, -81], [0, -80], [8, -79], [14, -87], [18, -100], [30, -115], [60, -140], [66, -168]];

function pacificCoast(lat: number) {
  const pts = PACIFIC_COAST;
  if (lat <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [la, lo] = pts[i];
    const [pla, plo] = pts[i - 1];
    if (lat <= la) return plo + ((lat - pla) / (la - pla)) * (lo - plo);
  }
  return pts[pts.length - 1][1];
}

/** Which ocean basin a sea point lies in — coarse, but right for every open-water tap. */
export function oceanAt(lon: number, lat: number): RegionSlug {
  if (lat > 66) return "arctic-ocean";
  if (lat < -55) return "southern-ocean";
  const indian = lat <= 30 && lon >= 20 && (lon < 100 || (lon < 147 && lat < -11 && !(lon > 130 && lat > -30)));
  if (indian) return "indian-ocean";
  if (lon >= pacificCoast(lat) && (lon < 20 || (lat > 30 && lon < 45))) return "atlantic-ocean";
  return "pacific-ocean";
}

/* Ocean animals whose range text names a coast rather than an ocean. */
const OCEAN_OVERRIDES: Record<string, RegionSlug[]> = {
  blobfish: ["pacific-ocean"],
  "leafy-seadragon": ["indian-ocean"],
  "weedy-seadragon": ["pacific-ocean", "indian-ocean"],
  wobbegong: ["indian-ocean", "pacific-ocean"],
  "flamboyant-cuttlefish": ["pacific-ocean", "indian-ocean"],
  "yeti-crab": ["pacific-ocean", "southern-ocean"],
  "colossal-squid": ["southern-ocean"],
  "japanese-spider-crab": ["pacific-ocean"],
  "flower-hat-jellyfish": ["pacific-ocean"],
  "comb-jelly": ["atlantic-ocean"],
};

const WORLDWIDE: RegionSlug[] = ["pacific-ocean", "atlantic-ocean", "indian-ocean"];

/** Ocean basins for a sea creature, read from its range when not stated in the record. */
export function oceanRegionsOf(c: OceanCreature): RegionSlug[] {
  if (c.regions?.length) return c.regions;
  if (OCEAN_OVERRIDES[c.slug]) return OCEAN_OVERRIDES[c.slug];
  const r = c.stats.range.toLowerCase();
  if (/worldwide|all oceans|temperate to tropical seas/.test(r)) return WORLDWIDE;
  const out = new Set<RegionSlug>();
  if (/indo-/.test(r)) out.add("indian-ocean").add("pacific-ocean");
  if (/pacific/.test(r)) out.add("pacific-ocean");
  if (/atlantic|caribbean|mediterranean|gulf of mexico/.test(r)) out.add("atlantic-ocean");
  if (/indian ocean|red sea/.test(r)) out.add("indian-ocean");
  if (/arctic/.test(r)) out.add("arctic-ocean");
  if (/antarctic|southern ocean/.test(r)) out.add("southern-ocean");
  return out.size ? [...out] : WORLDWIDE;
}

export const regionsOf = (c: Creature): RegionSlug[] => (c.realm === "ocean" ? oceanRegionsOf(c) : c.regions);

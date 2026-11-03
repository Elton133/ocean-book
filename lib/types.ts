export type Realm = "ocean" | "land";

export type CategorySlug =
  // Ocean shelves
  | "deep-sea"
  | "bioluminescent"
  | "intelligent"
  | "camouflage"
  | "giants"
  | "venomous"
  | "transparent"
  | "reproduction"
  | "ancient"
  // Land shelves (camouflage and venomous are shared)
  | "apex-predators"
  | "desert-survivors"
  | "rainforest-canopy"
  | "migrations"
  | "nocturnal"
  | "endangered"
  | "fliers";

/** How an animal of the air flies: the shelves of "Masters of the Air". */
export type FlightStyle = "soaring" | "diving" | "hovering" | "silent" | "echolocating" | "migrating" | "foraging";

export type Certainty = "confirmed" | "hypothesis" | "uncertain";

/** Every media asset carries its provenance so credits can always be rendered. */
export interface MediaAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  creator: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
  species: string;
  type: "photograph" | "video" | "illustration" | "diagram";
  setting?: "in situ" | "aquarium" | "specimen" | "illustration" | string;
  /** CSS object-position used when cropping to a full-bleed frame. */
  focal?: string;
  tone?: "dark" | "light";
  /** Video only. */
  poster?: string;
}

export interface Reference {
  title: string;
  publisher: string;
  url?: string;
  year?: number;
  authors?: string;
}

export interface Fact {
  title: string;
  text: string;
  certainty: Certainty;
  /** Index into the creature's references. */
  ref?: number;
}

interface CreatureBase {
  slug: string;
  commonName: string;
  scientificName: string;
  authority?: string;
  taxonomy: { phylum: string; class: string; order: string; family: string };
  group: string;
  categories: CategorySlug[];
  tagline: string;
  summary: string;
  ability: string;
  facts: Fact[];
  references: Reference[];
  image: MediaAsset | null;
  gallery?: MediaAsset[];
  notes?: string;
  /** Optional per-creature accent colour for the book chrome. */
  accent?: string;
  /** Anatomy, senses, body, genome, mind, survival and life cycle, from data/deep/<slug>.json. */
  deep?: Deep;
}

/* ------------------------------------------------------------------ */
/* Deep chapters: the octopus book's depth, as data any animal can fill. */
/* Every `ref` indexes the creature's references, which `extraReferences`  */
/* in its deep file extends (appended after the record's own).            */
/* ------------------------------------------------------------------ */

export type SenseKind =
  | "sight"
  | "hearing"
  | "smell"
  | "taste"
  | "touch"
  | "electroreception"
  | "echolocation"
  | "magnetoreception"
  | "heat"
  | "vibration"
  | "balance"
  | "other";

export interface DeepPoint {
  title: string;
  text: string;
  certainty: Certainty;
  ref?: number;
}

export interface Deep {
  /** Labels placed on one of the animal's photographs: 0 is the cover image, 1+ the gallery. */
  anatomy?: {
    lede: string;
    media: number;
    /** x and y are percentages of the photograph's width and height. */
    hotspots: { id: string; label: string; x: number; y: number; text: string; ref?: number }[];
    stats: { value: string; label: string; ref?: number }[];
  };
  senses?: {
    lede: string;
    senses: { kind: SenseKind; name: string; text: string; vsHuman?: "keener" | "weaker" | "similar" | "absent in us"; certainty: Certainty; ref?: number }[];
  };
  body?: { lede: string; systems: DeepPoint[] };
  genome?: {
    lede: string;
    /** Diploid chromosome count (2n), where published. */
    diploid?: number;
    /** Assembled or estimated genome size in billions of base pairs. */
    genomeGb?: number;
    refs?: { diploid?: number; genome?: number };
    /** Year a reference genome was published, or null if none yet. */
    sequenced?: number | null;
    findings: DeepPoint[];
  };
  mind?: { lede: string; studies: { year: string; title: string; text: string; certainty: Certainty; ref?: number }[] };
  survival?: { lede: string; tactics: DeepPoint[]; predators: string[]; threats?: DeepPoint[] };
  life?: {
    lede: string;
    stages: { name: string; duration?: string; text: string; ref?: number }[];
    lifespan?: { value: string; ref?: number };
  };
}

interface BaseStats {
  size: string;
  range: string;
  diet: string;
  conservation: string;
}

export interface OceanCreature extends CreatureBase {
  realm: "ocean";
  aphiaId?: number;
  stats: BaseStats & { depth: string };
  /** `approx` marks gauge values estimated from qualitative sources ("shallow", "midwater"). */
  depthRange: { min: number; max: number; approx?: boolean };
  /** Ocean basins on the globe; derived from `stats.range` when omitted. */
  regions?: RegionSlug[];
}

export interface LandCreature extends CreatureBase {
  realm: "land";
  gbifId?: number;
  iucnId?: number;
  stats: BaseStats & { habitat: string; elevation?: string };
  elevationRange?: { min: number; max: number; approx?: boolean };
  regions: RegionSlug[];
  biome: BiomeSlug;
  /** Set for animals that fly; groups them in "Masters of the Air". */
  flight?: FlightStyle;
  /** Sourced figures a signature chapter is drawn from; `refs` maps each figure to a reference index. */
  signatureData?: { refs?: Record<string, number> } & Record<string, number | Record<string, number> | undefined>;
}

export type Creature = OceanCreature | LandCreature;

export type BiomeSlug =
  | "ocean"
  | "rainforest"
  | "monsoon-forest"
  | "wetland"
  | "savanna"
  | "desert"
  | "grassland"
  | "temperate-forest"
  | "taiga"
  | "mountain"
  | "tundra"
  | "polar"
  | "island";

export type RegionSlug =
  | "amazon"
  | "pantanal"
  | "central-america"
  | "andes-patagonia"
  | "galapagos"
  | "north-american-deserts"
  | "north-american-forests"
  | "arctic-tundra"
  | "sahara-arabia"
  | "african-savanna"
  | "congo-basin"
  | "namib-kalahari"
  | "madagascar"
  | "indian-subcontinent"
  | "himalaya-tibet"
  | "china-mongolia"
  | "siberian-taiga"
  | "europe"
  | "borneo-sumatra"
  | "australian-outback"
  | "eastern-australia-new-guinea"
  | "antarctica"
  | "pacific-ocean"
  | "atlantic-ocean"
  | "indian-ocean"
  | "southern-ocean"
  | "arctic-ocean";

export type PageTheme = "abyss" | "deep" | "teal" | "ivory" | "canopy" | "dune" | "savanna" | "tundra";

/**
 * A book page is pure data: a layout key resolved by the client-side registry,
 * plus layout-specific props. This keeps books serialisable and reusable.
 */
export interface PageSpec<D = Record<string, unknown>> {
  id: string;
  layout: string;
  chapter: string;
  title: string;
  theme: PageTheme;
  data?: D;
}

/** A film of the animal on YouTube, checked to be public and embeddable. */
export interface Film {
  youtubeId: string;
  /** Title and channel exactly as YouTube reports them. */
  title: string;
  channel: string;
  kind: "wild footage" | "aquarium footage" | "explainer" | "specimen";
  /** Editor's note on why this film was chosen; not shown to readers. */
  note?: string;
}

export interface Book {
  creature: Creature;
  /** null when no trustworthy film has been found yet. */
  film: Film | null;
  /** Ocean depth zone; null for land animals. */
  zone: import("./zones").ZoneSlug | null;
  pages: PageSpec[];
  related: Pick<Creature, "slug" | "commonName" | "scientificName" | "image">[];
}

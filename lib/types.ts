export type CategorySlug =
  | "deep-sea"
  | "bioluminescent"
  | "intelligent"
  | "camouflage"
  | "giants"
  | "venomous"
  | "transparent"
  | "reproduction"
  | "ancient";

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

export interface Creature {
  slug: string;
  commonName: string;
  scientificName: string;
  authority?: string;
  aphiaId?: number;
  taxonomy: { phylum: string; class: string; order: string; family: string };
  group: string;
  categories: CategorySlug[];
  tagline: string;
  summary: string;
  ability: string;
  stats: { size: string; depth: string; range: string; diet: string; conservation: string };
  /** `approx` marks gauge values estimated from qualitative sources ("shallow", "midwater"). */
  depthRange: { min: number; max: number; approx?: boolean };
  facts: Fact[];
  references: Reference[];
  image: MediaAsset | null;
  gallery?: MediaAsset[];
  notes?: string;
  /** Optional per-creature accent colour for the book chrome. */
  accent?: string;
}

export type PageTheme = "abyss" | "deep" | "teal" | "ivory";

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

export interface Book {
  creature: Creature;
  zone: import("./zones").ZoneSlug;
  pages: PageSpec[];
  related: Pick<Creature, "slug" | "commonName" | "scientificName" | "image">[];
}

"use client";

import type { ComponentType } from "react";
import type { Book, PageSpec } from "@/lib/types";
import { CoverSpread, ProfileSpread, FeatureSpread, FactSpread, PlateSpread, DepthSpread } from "@/components/pages/GenericSpreads";
import { ClosingSpread, SourcesSpread } from "@/components/pages/ClosingSpread";
import { DocumentarySpread } from "@/components/pages/DocumentarySpread";
import {
  OctoEncounter,
  OctoMeet,
  OctoDisguise,
  OctoArms,
  OctoHearts,
  OctoMind,
  OctoSurvival,
  OctoWorld,
  OctoGeneration,
} from "@/components/octopus/OctopusSpreads";
import { LureSpread, MantisSpread, BarreleyeSpread, DumboSpread } from "@/components/signature/SignatureSpreads";

export interface PageProps {
  page: PageSpec;
  book: Book;
  index: number;
  total: number;
  goTo: (i: number) => void;
}

/** Layout registry: page data names a layout; this resolves it. */
const LAYOUTS: Record<string, ComponentType<PageProps>> = {
  cover: CoverSpread,
  profile: ProfileSpread,
  feature: FeatureSpread,
  facts: FactSpread,
  plate: PlateSpread,
  depth: DepthSpread,
  closing: ClosingSpread,
  sources: SourcesSpread,
  documentary: DocumentarySpread,
  "octo-encounter": OctoEncounter,
  "octo-meet": OctoMeet,
  "octo-disguise": OctoDisguise,
  "octo-arms": OctoArms,
  "octo-hearts": OctoHearts,
  "octo-mind": OctoMind,
  "octo-survival": OctoSurvival,
  "octo-world": OctoWorld,
  "octo-generation": OctoGeneration,
  "sig-lure": LureSpread,
  "sig-mantis": MantisSpread,
  "sig-barreleye": BarreleyeSpread,
  "sig-dumbo": DumboSpread,
};

/**
 * How many single pages a spread breaks into on narrow screens — the way a
 * two-page spread reads one page at a time on a small book.
 */
export const LAYOUT_PARTS: Record<string, number> = {
  profile: 2,
  facts: 2,
  depth: 2,
  closing: 2,
  sources: 2,
  "octo-meet": 2,
  "octo-disguise": 2,
  "octo-arms": 3,
  "octo-hearts": 3,
  "octo-mind": 2,
  "octo-survival": 3,
  "octo-world": 3,
  "octo-generation": 2,
  "sig-lure": 2,
  "sig-mantis": 2,
  "sig-barreleye": 2,
  "sig-dumbo": 2,
};

/** Spreads that are mostly picture: the interface steps back while you look. */
export const IMMERSIVE = new Set(["octo-encounter", "cover", "plate", "documentary"]);

export function BookPage(props: PageProps) {
  const Layout = LAYOUTS[props.page.layout] ?? FactSpread;
  return <Layout {...props} />;
}

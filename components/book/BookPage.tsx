"use client";

import type { ComponentType } from "react";
import type { Book, PageSpec } from "@/lib/types";
import { CoverSpread, ProfileSpread, FeatureSpread, FactSpread, PlateSpread, DepthSpread } from "@/components/pages/GenericSpreads";
import { ClosingSpread } from "@/components/pages/ClosingSpread";
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

export function BookPage(props: PageProps) {
  const Layout = LAYOUTS[props.page.layout] ?? FactSpread;
  return <Layout {...props} />;
}

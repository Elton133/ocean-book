import type { BiomeSlug, Creature, Deep, PageSpec, PageTheme } from "./types";

/** Deep chapter order and titles (layouts live in components/deep/DeepSpreads.tsx). */
const DEEP_CHAPTERS: { key: keyof Deep; layout: string; title: string }[] = [
  { key: "anatomy", layout: "deep-anatomy", title: "Anatomy" },
  { key: "senses", layout: "deep-senses", title: "The Senses" },
  { key: "body", layout: "deep-body", title: "Inside the Body" },
  { key: "genome", layout: "deep-genome", title: "The Genome" },
  { key: "mind", layout: "deep-mind", title: "Behaviour & Mind" },
  { key: "survival", layout: "deep-survival", title: "Survival" },
  { key: "life", layout: "deep-life", title: "The Life Cycle" },
];

/**
 * Signature interactive chapters, inserted only where an interaction genuinely
 * explains something about the animal.
 */
const SIGNATURE: Record<string, { layout: string; title: string }> = {
  "humpback-anglerfish": { layout: "sig-lure", title: "The Living Lantern" },
  footballfish: { layout: "sig-lure", title: "The Living Lantern" },
  "peacock-mantis-shrimp": { layout: "sig-mantis", title: "Eyes and Hammers" },
  barreleye: { layout: "sig-barreleye", title: "Looking Up" },
  "dumbo-octopus": { layout: "sig-dumbo", title: "Flying Underwater" },
  cheetah: { layout: "sig-cheetah", title: "Built for the Sprint" },
  "african-bush-elephant": { layout: "sig-elephant", title: "Voices Below Hearing" },
  "peregrine-falcon": { layout: "sig-stoop", title: "The Stoop" },
  "ruby-throated-hummingbird": { layout: "sig-hover", title: "A Blur of Wings" },
  "greater-horseshoe-bat": { layout: "sig-echo", title: "Seeing with Sound" },
};

/* A land book takes its page grounds from the animal's habitat. */
const BIOME_THEME: Partial<Record<BiomeSlug, PageTheme>> = {
  rainforest: "canopy",
  "monsoon-forest": "canopy",
  "temperate-forest": "canopy",
  taiga: "canopy",
  wetland: "canopy",
  desert: "dune",
  island: "dune",
  savanna: "savanna",
  grassland: "savanna",
  mountain: "tundra",
  tundra: "tundra",
  polar: "tundra",
};

/** The dark grounds of a book: [cover and signature, field notes, its world]. */
function grounds(c: Creature): [PageTheme, PageTheme, PageTheme] {
  if (c.realm === "ocean") return ["abyss", "teal", "deep"];
  const t = BIOME_THEME[c.biome] ?? "canopy";
  return [t, t, t];
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Builds a creature's book from its record; page count adapts to the content available. */
export function buildDefaultPages(c: Creature): PageSpec[] {
  const pages: Omit<PageSpec, "chapter">[] = [];
  const [ground, notes, world] = grounds(c);
  const deep = c.realm === "ocean" ? "deep" : ground;

  pages.push({ id: "cover", layout: "cover", title: c.commonName, theme: ground });
  pages.push({ id: "profile", layout: "profile", title: `Meet the ${c.commonName}`, theme: "ivory" });

  const sig = SIGNATURE[c.slug];
  // Land interactives are drawn from sourced figures, so they appear only once those exist.
  if (sig && (c.realm === "ocean" || c.signatureData)) pages.push({ id: "signature", layout: sig.layout, title: sig.title, theme: ground });

  // The deep chapters, in order, wherever the animal's research supports them.
  const research: Deep = c.deep ?? {};
  for (const ch of DEEP_CHAPTERS) {
    if (!research[ch.key]) continue;
    pages.push({ id: ch.key, layout: ch.layout, title: ch.title, theme: ch.key === "anatomy" ? "ivory" : ch.key === "genome" || ch.key === "body" ? notes : ground });
  }

  const facts = c.facts ?? [];
  if (facts.length) {
    pages.push({
      id: "feature",
      layout: "feature",
      title: facts[0].title,
      theme: c.gallery?.length ? ground : deep,
      // Without a second photograph the spread goes typographic rather than repeat the cover.
      data: { fact: 0, media: c.gallery?.[0] ?? null },
    });
  }
  if (facts.length > 1) {
    pages.push({ id: "facts", layout: "facts", title: "Field Notes", theme: notes, data: { from: 1 } });
  }
  if (c.gallery && c.gallery.length > 1) {
    pages.push({ id: "plate", layout: "plate", title: "Plate", theme: ground, data: { media: c.gallery[1] } });
  }
  pages.push({ id: "world", layout: c.realm === "ocean" ? "depth" : "range", title: "Its World", theme: world });
  pages.push({ id: "farewell", layout: "closing", title: "Before You Leave", theme: "ivory" });
  pages.push({ id: "sources", layout: "sources", title: "Sources & Credits", theme: "ivory" });

  return pages.map((p, i) => ({ ...p, chapter: pad(i + 1) }));
}

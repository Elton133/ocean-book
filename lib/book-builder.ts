import type { Creature, PageSpec } from "./types";

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
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Builds a creature's book from its record; page count adapts to the content available. */
export function buildDefaultPages(c: Creature): PageSpec[] {
  const pages: Omit<PageSpec, "chapter">[] = [];

  pages.push({ id: "cover", layout: "cover", title: c.commonName, theme: "abyss" });
  pages.push({ id: "profile", layout: "profile", title: `Meet the ${c.commonName}`, theme: "ivory" });

  const sig = SIGNATURE[c.slug];
  if (sig) pages.push({ id: "signature", layout: sig.layout, title: sig.title, theme: "abyss" });

  const facts = c.facts ?? [];
  if (facts.length) {
    pages.push({
      id: "feature",
      layout: "feature",
      title: facts[0].title,
      theme: c.gallery?.length ? "abyss" : "deep",
      // Without a second photograph the spread goes typographic rather than repeat the cover.
      data: { fact: 0, media: c.gallery?.[0] ?? null },
    });
  }
  if (facts.length > 1) {
    pages.push({ id: "facts", layout: "facts", title: "Field Notes", theme: "teal", data: { from: 1 } });
  }
  if (c.gallery && c.gallery.length > 1) {
    pages.push({ id: "plate", layout: "plate", title: "Plate", theme: "abyss", data: { media: c.gallery[1] } });
  }
  pages.push({ id: "world", layout: "depth", title: "Its World", theme: "deep" });
  pages.push({ id: "farewell", layout: "closing", title: "Before You Leave", theme: "ivory" });
  pages.push({ id: "sources", layout: "sources", title: "Sources & Credits", theme: "ivory" });

  return pages.map((p, i) => ({ ...p, chapter: pad(i + 1) }));
}

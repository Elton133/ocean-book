// Merges data/creatures/*.json into data/catalogue.generated.json, validating
// the fields the book system relies on. Runs before `dev` and `build`.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dir = join(root, "data/creatures");
// Shelves per realm, as in lib/categories.ts.
const CATS = {
  ocean: new Set(["deep-sea", "bioluminescent", "intelligent", "camouflage", "giants", "venomous", "transparent", "reproduction", "ancient"]),
  land: new Set(["apex-predators", "desert-survivors", "rainforest-canopy", "migrations", "nocturnal", "camouflage", "venomous", "endangered", "fliers"]),
};
// How an animal of the air flies, as in lib/flight.ts.
const FLIGHT = new Set(["soaring", "diving", "hovering", "silent", "echolocating", "migrating", "foraging"]);
const COMMON = ["slug", "commonName", "scientificName", "taxonomy", "group", "categories", "tagline", "summary", "stats", "facts", "references"];
const REQUIRED = {
  ocean: [...COMMON, "depthRange"],
  land: [...COMMON, "regions", "biome"],
};
const STATS = { ocean: ["depth"], land: ["habitat"] };
const world = JSON.parse(readFileSync(join(root, "data/world.json"), "utf8"));
const REGIONS = new Set(world.regions.map((r) => r.slug));
const BIOMES = new Set(world.biomes.map((b) => b.slug));

const out = [];
const problems = [];

/*
 * Deep chapters live beside the records in data/deep/<slug>.json. Their
 * `extraReferences` are appended to the record's own, and every `ref` must
 * point inside the combined list; anything that does not is dropped.
 */
const SENSES = new Set(["sight", "hearing", "smell", "taste", "touch", "electroreception", "echolocation", "magnetoreception", "heat", "vibration", "balance", "other"]);
function attachDeep(c) {
  const path = join(root, "data/deep", `${c.slug}.json`);
  if (!existsSync(path)) return;
  let d;
  try {
    d = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    problems.push(`deep/${c.slug}.json: invalid JSON (${e.message}) — ignored`);
    return;
  }
  const { extraReferences = [], ...deep } = d;
  c.references = [...c.references, ...extraReferences];
  const n = c.references.length;
  let bad = 0;
  const check = (o) => {
    if (o && typeof o === "object") {
      if ("ref" in o && o.ref != null && !(Number.isInteger(o.ref) && o.ref >= 0 && o.ref < n)) {
        bad++;
        delete o.ref;
      }
      Object.values(o).forEach(check);
    }
  };
  check(deep);
  for (const k of ["diploid", "genome"]) {
    const r = deep.genome?.refs?.[k];
    if (r != null && !(r >= 0 && r < n)) {
      bad++;
      delete deep.genome.refs[k];
    }
  }
  if (bad) problems.push(`deep/${c.slug}.json: ${bad} reference index(es) out of range — dropped`);
  if (deep.anatomy) {
    const media = [c.image, ...(c.gallery ?? [])][deep.anatomy.media ?? 0];
    if (!media) {
      problems.push(`deep/${c.slug}.json: anatomy photograph ${deep.anatomy.media} not found — anatomy dropped`);
      delete deep.anatomy;
    } else {
      deep.anatomy.hotspots = deep.anatomy.hotspots.filter((h) => h.x >= 0 && h.x <= 100 && h.y >= 0 && h.y <= 100);
    }
  }
  if (deep.senses) {
    const unknown = deep.senses.senses.filter((s) => !SENSES.has(s.kind));
    if (unknown.length) problems.push(`deep/${c.slug}.json: unknown senses ${unknown.map((s) => s.kind).join(", ")} — dropped`);
    deep.senses.senses = deep.senses.senses.filter((s) => SENSES.has(s.kind));
  }
  c.deep = deep;
}
for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  let c;
  try {
    c = JSON.parse(readFileSync(join(dir, file), "utf8"));
  } catch (e) {
    problems.push(`${file}: invalid JSON (${e.message})`);
    continue;
  }
  // Records written before land animals existed carry no realm.
  c.realm ??= "ocean";
  if (!REQUIRED[c.realm]) {
    problems.push(`${file}: unknown realm "${c.realm}" — skipped`);
    continue;
  }
  const missing = [...REQUIRED[c.realm], ...STATS[c.realm].map((k) => `stats.${k}`)].filter((k) =>
    k.startsWith("stats.") ? c.stats?.[k.slice(6)] == null : c[k] == null,
  );
  if (missing.length) {
    problems.push(`${file}: missing ${missing.join(", ")} — skipped`);
    continue;
  }
  if (c.biome != null && !BIOMES.has(c.biome)) {
    problems.push(`${file}: unknown biome "${c.biome}" — skipped`);
    continue;
  }
  const strays = (c.regions ?? []).filter((r) => !REGIONS.has(r));
  if (strays.length) {
    problems.push(`${file}: unknown regions ${strays.join(", ")} — dropped`);
    c.regions = c.regions.filter((r) => REGIONS.has(r));
  }
  if (c.realm === "land" && !c.regions.length) {
    problems.push(`${file}: no valid regions — skipped`);
    continue;
  }
  if (c.flight != null && !FLIGHT.has(c.flight)) {
    problems.push(`${file}: unknown flight style "${c.flight}" — dropped`);
    delete c.flight;
  }
  // Every flier is shelved with the others, whatever the record says.
  if (c.flight && !c.categories.includes("fliers")) c.categories.push("fliers");
  const offShelf = c.categories.filter((k) => !CATS[c.realm].has(k));
  if (offShelf.length) problems.push(`${file}: categories ${offShelf.join(", ")} not shelved for ${c.realm} — dropped`);
  c.categories = c.categories.filter((k) => CATS[c.realm].has(k));
  for (const img of [c.image, ...(c.gallery ?? [])].filter(Boolean)) {
    if (!existsSync(join(root, "public", img.src))) {
      problems.push(`${file}: media not found ${img.src}`);
    }
  }
  if (c.image && !existsSync(join(root, "public", c.image.src))) c.image = null;
  c.gallery = (c.gallery ?? []).filter((g) => existsSync(join(root, "public", g.src)));
  c.facts = c.facts.filter((f) => f && f.text);
  attachDeep(c);
  out.push(c);
}

writeFileSync(join(root, "data/catalogue.generated.json"), JSON.stringify(out, null, 1));
console.log(`catalogue: ${out.length} creatures${problems.length ? `\n  ! ${problems.join("\n  ! ")}` : ""}`);

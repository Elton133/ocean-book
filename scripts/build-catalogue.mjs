// Merges data/creatures/*.json into data/catalogue.generated.json, validating
// the fields the book system relies on. Runs before `dev` and `build`.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dir = join(root, "data/creatures");
const CATS = new Set(["deep-sea", "bioluminescent", "intelligent", "camouflage", "giants", "venomous", "transparent", "reproduction", "ancient"]);
const REQUIRED = ["slug", "commonName", "scientificName", "taxonomy", "group", "categories", "tagline", "summary", "stats", "depthRange", "facts", "references"];

const out = [];
const problems = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  let c;
  try {
    c = JSON.parse(readFileSync(join(dir, file), "utf8"));
  } catch (e) {
    problems.push(`${file}: invalid JSON (${e.message})`);
    continue;
  }
  const missing = REQUIRED.filter((k) => c[k] == null);
  if (missing.length) {
    problems.push(`${file}: missing ${missing.join(", ")} — skipped`);
    continue;
  }
  c.categories = c.categories.filter((k) => CATS.has(k));
  for (const img of [c.image, ...(c.gallery ?? [])].filter(Boolean)) {
    if (!existsSync(join(root, "public", img.src))) {
      problems.push(`${file}: media not found ${img.src}`);
    }
  }
  if (c.image && !existsSync(join(root, "public", c.image.src))) c.image = null;
  c.gallery = (c.gallery ?? []).filter((g) => existsSync(join(root, "public", g.src)));
  c.facts = c.facts.filter((f) => f && f.text);
  out.push(c);
}

writeFileSync(join(root, "data/catalogue.generated.json"), JSON.stringify(out, null, 1));
console.log(`catalogue: ${out.length} creatures${problems.length ? `\n  ! ${problems.join("\n  ! ")}` : ""}`);

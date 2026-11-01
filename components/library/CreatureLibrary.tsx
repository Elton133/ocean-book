"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { LibraryEntry } from "@/lib/catalogue";
import type { CategorySlug } from "@/lib/types";
import { CATEGORIES, categoryTitle } from "@/lib/categories";
import { ZONES, type Zone, type ZoneSlug } from "@/lib/zones";
import { EASE_OUT } from "@/lib/motion";
import { Environment } from "./Environment";

/** Remember that the reader came from the library, so "close" can go back. */
export function markFromLibrary() {
  try {
    sessionStorage.setItem("ob:from-library", "1");
  } catch {}
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function haystack(e: LibraryEntry) {
  return norm(
    [
      e.commonName,
      e.scientificName,
      e.group,
      e.tagline,
      e.ability,
      e.taxonomy.phylum,
      e.taxonomy.class,
      e.taxonomy.order,
      e.taxonomy.family,
      ...e.categories.map(categoryTitle),
    ].join(" · "),
  );
}

/** Where a query matched, so results can say why they appear. */
function matchReason(e: LibraryEntry, q: string) {
  if (!q) return null;
  const t = (s: string) => norm(s).includes(q);
  if (t(e.commonName)) return null;
  if (t(e.scientificName)) return e.scientificName;
  for (const k of ["class", "order", "family", "phylum"] as const) if (t(e.taxonomy[k])) return `${k[0].toUpperCase()}${k.slice(1)}: ${e.taxonomy[k]}`;
  if (t(e.ability)) return e.ability;
  if (t(e.group)) return e.group;
  const cat = e.categories.find((c) => t(categoryTitle(c)));
  if (cat) return categoryTitle(cat);
  return e.tagline;
}

/* Book cloth darkens with depth. */
const CLOTH: Record<ZoneSlug, string[]> = {
  surface: ["#1d5e7a", "#24506b", "#1f6a73", "#2a5a63", "#2b4f6f"],
  twilight: ["#173a57", "#1c3149", "#22324f", "#14304a", "#1d2b44"],
  midnight: ["#0f1a2c", "#121c2a", "#0d1626", "#151b2e", "#101827"],
  abyssal: ["#0b0f18", "#0e121b", "#0a0d14"],
  hadal: ["#07090d", "#0a0c10"],
};
const clothFor = (e: LibraryEntry, i: number) => CLOTH[e.zone][(i + e.commonName.length) % CLOTH[e.zone].length];

const ROMAN = ["I", "II", "III", "IV", "V"];
const fmt = (n: number) => n.toLocaleString("en-GB");

function Shelf({ items, q, zone }: { items: LibraryEntry[]; q: string; zone: Zone }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Vertical wheel scrolls the shelf sideways while the pointer is over it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      if (Math.abs(ev.deltaY) < Math.abs(ev.deltaX) || el.scrollWidth <= el.clientWidth) return;
      const atStart = el.scrollLeft <= 0 && ev.deltaY < 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && ev.deltaY > 0;
      if (atStart || atEnd) return;
      ev.preventDefault();
      el.scrollLeft += ev.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div ref={ref} className="no-scrollbar mt-10 hidden overflow-x-auto pb-4 md:block">
      <ul className="flex h-[54vh] min-h-[380px] items-end gap-[3px]">
        {items.map((e, i) => {
          const isOpen = open === e.slug;
          return (
            <motion.li
              key={e.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              animate={{ width: isOpen ? 360 : 68 }}
              transition={{ duration: reduced ? 0 : 0.8, ease: EASE_OUT, delay: reduced ? 0 : Math.min(i, 16) * 0.03 }}
              onMouseEnter={() => setOpen(e.slug)}
              onMouseLeave={() => setOpen(null)}
              className="relative shrink-0"
              style={{ height: `${84 + ((i * 7) % 16)}%` }}
            >
              <Link
                href={`/creatures/${e.slug}`}
                onClick={markFromLibrary}
                onFocus={() => setOpen(e.slug)}
                onBlur={() => setOpen(null)}
                className="group relative block h-full overflow-hidden border border-ivory/10 shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
                style={{ background: clothFor(e, i) }}
                aria-label={`${e.commonName}, ${e.scientificName}. ${e.pageCount} pages.`}
              >
                {e.image && (
                  <motion.div className="absolute inset-0" initial={false} animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 1.15 }} transition={{ duration: 0.9, ease: EASE_OUT }}>
                    <Image src={e.image.src} alt="" fill sizes="360px" className="object-cover" style={{ objectPosition: e.image.focal }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
                  </motion.div>
                )}
                {/* the spine: gilt rules, title, depth */}
                <motion.div className="absolute inset-0 flex flex-col items-center justify-between py-4" initial={false} animate={{ opacity: isOpen ? 0 : 1 }} transition={{ duration: 0.4 }}>
                  <span className="flex flex-col items-center gap-1">
                    <span className="h-px w-7 bg-[#d8c08a]/50" />
                    <span className="h-px w-7 bg-[#d8c08a]/50" />
                  </span>
                  <span className="display rotate-180 whitespace-nowrap text-[1.35rem] leading-none [writing-mode:vertical-rl]">{e.commonName}</span>
                  <span className="annot text-[0.55rem] opacity-50 [writing-mode:vertical-rl]">{fmt(e.depthRange.min)}–{fmt(e.depthRange.max)} m</span>
                </motion.div>
                <motion.div
                  className="absolute inset-x-0 bottom-0 p-5"
                  initial={false}
                  animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
                  transition={{ duration: 0.6, ease: EASE_OUT, delay: isOpen ? 0.2 : 0 }}
                >
                  <p className="annot uppercase tracking-[0.18em] opacity-70">{e.group}</p>
                  <p className="display mt-1 text-3xl leading-none">{e.commonName}</p>
                  <p className="mt-1 text-sm italic opacity-80">{e.scientificName}</p>
                  <p className="mt-3 text-sm leading-snug opacity-80">{e.tagline}</p>
                  {q && matchReason(e, q) && <p className="annot mt-2 text-biolume">Matched: {matchReason(e, q)}</p>}
                  <p className="annot mt-3 opacity-60">
                    {e.pageCount} pages · {zone.scientific} · Open →
                  </p>
                </motion.div>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

function IndexList({ items, q, always }: { items: LibraryEntry[]; q: string; always: boolean }) {
  return (
    <ul className={`mt-8 grid gap-x-12 md:grid-cols-2 ${always ? "" : "md:hidden"}`}>
      {items.map((e, i) => (
        <li key={e.slug}>
          <Link href={`/creatures/${e.slug}`} onClick={markFromLibrary} className="group flex items-center gap-4 border-b border-ivory/12 py-3">
            <div className="relative h-16 w-20 shrink-0 overflow-hidden" style={{ background: clothFor(e, i) }}>
              {e.image && <Image src={e.image.src} alt="" fill sizes="80px" className="object-cover transition duration-700 group-hover:scale-110" style={{ objectPosition: e.image.focal }} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="display truncate text-2xl leading-tight transition group-hover:translate-x-1">{e.commonName}</p>
              <p className="truncate text-xs italic opacity-60">
                {e.scientificName} · {fmt(e.depthRange.min)}–{fmt(e.depthRange.max)} m
              </p>
              {q && matchReason(e, q) && <p className="annot truncate text-biolume">Matched: {matchReason(e, q)}</p>}
            </div>
            <span className="annot shrink-0 opacity-40">{e.pageCount} pp.</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * The library as a descent. Each depth zone is a band of water with its own
 * light and life; the shelves hold the animals that live there.
 */
export function CreatureLibrary({ entries }: { entries: LibraryEntry[] }) {
  const reduced = useReducedMotion();
  const [shelf, setShelf] = useState<CategorySlug | "all">("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"shelf" | "index">("shelf");
  const q = norm(useDeferredValue(query).trim());
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(() => entries.map((e) => ({ e, h: haystack(e) })), [entries]);
  const results = useMemo(
    () => index.filter(({ e, h }) => (shelf === "all" || e.categories.includes(shelf)) && (!q || q.split(/\s+/).every((w) => h.includes(w)))).map(({ e }) => e),
    [index, shelf, q],
  );
  const byZone = useMemo(
    () =>
      ZONES.map((z) => ({
        zone: z,
        items: results.filter((e) => e.zone === z.slug).sort((a, b) => a.depthRange.min - b.depthRange.min || a.depthRange.max - b.depthRange.max),
        total: entries.filter((e) => e.zone === z.slug).length,
      })),
    [results, entries],
  );

  // "/" focuses search, like a library catalogue terminal.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "/" && document.activeElement?.tagName !== "INPUT") {
        ev.preventDefault();
        inputRef.current?.focus();
        document.getElementById("library")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reduced]);

  const cat = CATEGORIES.find((c) => c.slug === shelf);
  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.slug, entries.filter((e) => e.categories.includes(c.slug)).length])), [entries]);
  const filtering = q || shelf !== "all";

  return (
    <section id="library" className="relative z-10">
      {/* Catalogue desk, at the surface */}
      <div className="relative px-5 pb-6 pt-24 sm:px-10 md:pl-24 lg:px-16 lg:pl-28" style={{ background: `linear-gradient(180deg, var(--abyss), ${ZONES[0].water[0]})` }}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE_OUT }}>
            <p className="eyebrow opacity-70">The Library · a descent</p>
            <h2 className="display mt-3 text-[clamp(3rem,7vw,7rem)] leading-[0.9]">
              {entries.length} <i>volumes</i>,
              <br />
              <span className="text-[0.55em] italic opacity-80">from the surface to the trenches</span>
            </h2>
          </motion.div>

          <div className="w-full max-w-xl">
            <label htmlFor="search" className="annot uppercase tracking-[0.2em] opacity-60">
              Search by name, scientific name, classification or ability
            </label>
            <div className="relative mt-2 flex items-center border-b border-ivory/40 focus-within:border-ivory">
              <svg width="18" height="18" viewBox="0 0 18 18" className="mr-3 shrink-0 opacity-60" aria-hidden>
                <circle cx="7.5" cy="7.5" r="6" fill="none" stroke="currentColor" />
                <path d="M12 12l5 5" stroke="currentColor" />
              </svg>
              <input
                ref={inputRef}
                id="search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Cephalopoda, glowing lure, Physalia…"
                className="display w-full bg-transparent py-3 text-2xl italic placeholder:text-ivory/30 focus:outline-none sm:text-3xl"
                autoComplete="off"
              />
              <kbd className="annot ml-3 hidden border border-ivory/30 px-1.5 py-0.5 opacity-60 sm:inline">/</kbd>
            </div>
          </div>
        </div>

        {/* Shelves as a table of contents line */}
        <div className="no-scrollbar -mx-5 mt-10 overflow-x-auto px-5 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0">
          <div className="flex min-w-max items-baseline gap-x-1" role="tablist" aria-label="Shelves">
            {[{ slug: "all" as const, numeral: "", title: "All creatures" }, ...CATEGORIES].map((c, i) => {
              const on = shelf === c.slug;
              return (
                <span key={c.slug} className="inline-flex items-baseline">
                  {i > 0 && <span aria-hidden className="mx-2 opacity-30">·</span>}
                  <button role="tab" aria-selected={on} onClick={() => setShelf(c.slug)} className={`relative pb-1 transition ${on ? "opacity-100" : "opacity-55 hover:opacity-90"}`}>
                    <span className="display text-lg italic">{c.title}</span>
                    <sup className="annot ml-1 opacity-60">{c.slug === "all" ? entries.length : counts[c.slug]}</sup>
                    {on && <motion.span layoutId="shelf-underline" className="absolute inset-x-0 bottom-0 h-px bg-ivory" transition={{ duration: 0.6, ease: EASE_OUT }} />}
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-start justify-between gap-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={shelf + q}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.85, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl text-sm italic"
              aria-live="polite"
            >
              {q
                ? `${results.length} ${results.length === 1 ? "volume matches" : "volumes match"} “${query.trim()}”.`
                : cat
                  ? cat.blurb
                  : "Scroll down to descend. The shelves are arranged by the depth at which each animal usually lives."}
            </motion.p>
          </AnimatePresence>
          <div className="hidden shrink-0 items-baseline gap-3 md:flex" role="group" aria-label="View">
            {(["shelf", "index"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={`display text-lg italic transition ${view === v ? "underline decoration-1 underline-offset-4" : "opacity-50 hover:opacity-90"}`}>
                {v === "shelf" ? "Shelves" : "Index"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The descent */}
      {byZone.map(({ zone, items, total }, zi) => (
        <section
          key={zone.slug}
          data-zone={zone.slug}
          data-from={zone.from}
          data-to={zone.to}
          aria-label={`${zone.name}, ${fmt(zone.from)} to ${fmt(zone.to)} metres`}
          className={`relative overflow-hidden px-5 sm:px-10 md:pl-24 lg:px-16 lg:pl-28 ${items.length ? "min-h-[100svh] py-24" : filtering ? "py-16" : "min-h-[70svh] py-24"}`}
          style={{ background: `linear-gradient(180deg, ${zone.water[0]}, ${zone.water[1]})` }}
        >
          <Environment zone={zone.slug} />
          <div className="relative z-10">
            <motion.header
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 1.4, ease: EASE_OUT }}
              className="grid gap-6 lg:grid-cols-12"
            >
              <div className="lg:col-span-7">
                <p className="eyebrow opacity-70">
                  Zone {ROMAN[zi]} · {zone.scientific} · {fmt(zone.from)}–{fmt(zone.to)} m
                </p>
                <h3 className="display mt-3 text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.9]">{zone.name}</h3>
              </div>
              <div className="flex items-end lg:col-span-5">
                <p className="display text-xl italic leading-snug opacity-85 sm:text-2xl">
                  {zone.line}
                  <span className="annot mt-2 block not-italic opacity-70">
                    {filtering ? `${items.length} of ${total}` : total} {total === 1 ? "volume" : "volumes"} on this shelf
                  </span>
                </p>
              </div>
            </motion.header>

            {items.length > 0 ? (
              <>
                {view === "shelf" && <Shelf items={items} q={q} zone={zone} />}
                <IndexList items={items} q={q} always={view === "index"} />
              </>
            ) : (
              <p className="display mt-10 text-2xl italic opacity-50">{filtering ? "Nothing at this depth matches." : "No volumes yet."}</p>
            )}
          </div>
        </section>
      ))}

      {results.length === 0 && (
        <div className="bg-black px-5 py-12 text-center">
          <button
            onClick={() => {
              setQuery("");
              setShelf("all");
            }}
            className="display border-b border-ivory/40 pb-1 text-xl italic opacity-80 hover:opacity-100"
          >
            Clear the search and descend again
          </button>
        </div>
      )}
    </section>
  );
}

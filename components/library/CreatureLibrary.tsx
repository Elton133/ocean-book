"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { LibraryEntry } from "@/lib/catalogue";
import type { CategorySlug } from "@/lib/types";
import { CATEGORIES, categoryTitle } from "@/lib/categories";
import { EASE_OUT } from "@/lib/motion";

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

/* Spine colour drawn from the animal's group, in muted natural-history tones. */
const SPINE_TONES = ["#18303a", "#2a2320", "#13283f", "#2b2a1f", "#1f2b28", "#311d1d", "#1b1f33", "#26302a"];
const toneFor = (e: LibraryEntry) => SPINE_TONES[[...e.taxonomy.class].reduce((a, c) => a + c.charCodeAt(0), 0) % SPINE_TONES.length];

export function CreatureLibrary({ entries }: { entries: LibraryEntry[] }) {
  const reduced = useReducedMotion();
  const [shelf, setShelf] = useState<CategorySlug | "all">("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"shelf" | "index">("shelf");
  const [open, setOpen] = useState<string | null>(null);
  const q = norm(useDeferredValue(query).trim());
  const inputRef = useRef<HTMLInputElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => entries.map((e) => ({ e, h: haystack(e) })), [entries]);
  const results = useMemo(
    () => index.filter(({ e, h }) => (shelf === "all" || e.categories.includes(shelf)) && (!q || q.split(/\s+/).every((w) => h.includes(w)))).map(({ e }) => e),
    [index, shelf, q],
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

  // Vertical wheel scrolls the shelf sideways while the pointer is over it.
  useEffect(() => {
    const el = shelfRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      if (Math.abs(ev.deltaY) < Math.abs(ev.deltaX)) return;
      const atStart = el.scrollLeft <= 0 && ev.deltaY < 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && ev.deltaY > 0;
      if (atStart || atEnd) return;
      ev.preventDefault();
      el.scrollLeft += ev.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [view]);

  const cat = CATEGORIES.find((c) => c.slug === shelf);
  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.slug, entries.filter((e) => e.categories.includes(c.slug)).length])), [entries]);

  return (
    <section id="library" className="relative z-10 py-24 md:pl-16 lg:pl-12">
      <div className="px-5 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE_OUT }}>
            <p className="eyebrow opacity-60">The Library</p>
            <h2 className="display mt-3 text-[clamp(3rem,7vw,7rem)]">
              {entries.length} <i>volumes</i>
            </h2>
          </motion.div>

          {/* Search */}
          <div className="w-full max-w-xl">
            <label htmlFor="search" className="annot uppercase tracking-[0.2em] opacity-50">
              Search by name, scientific name, classification or ability
            </label>
            <div className="relative mt-2 flex items-center border-b border-ivory/30 focus-within:border-biolume">
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
                placeholder="e.g. Cephalopoda, bioluminescent lure, Physalia…"
                className="display w-full bg-transparent py-3 text-2xl italic placeholder:text-ivory/25 focus:outline-none sm:text-3xl"
                autoComplete="off"
              />
              <kbd className="annot ml-3 hidden border border-ivory/25 px-1.5 py-0.5 opacity-50 sm:inline">/</kbd>
            </div>
          </div>
        </div>

        {/* Shelves */}
        <div className="no-scrollbar -mx-5 mt-12 overflow-x-auto px-5 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0">
          <div className="flex min-w-max gap-1" role="tablist" aria-label="Shelves">
            {[{ slug: "all" as const, numeral: "·", title: "All creatures" }, ...CATEGORIES].map((c) => {
              const on = shelf === c.slug;
              return (
                <button
                  key={c.slug}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setShelf(c.slug)}
                  className={`group relative px-4 py-3 text-left transition ${on ? "opacity-100" : "opacity-50 hover:opacity-90"}`}
                >
                  <span className="annot mr-2 opacity-60">{c.numeral}</span>
                  <span className="eyebrow">{c.title}</span>
                  <span className="annot ml-2 opacity-50">{c.slug === "all" ? entries.length : counts[c.slug]}</span>
                  {on && <motion.span layoutId="shelf-underline" className="absolute inset-x-4 bottom-0 h-px bg-biolume" transition={{ duration: 0.6, ease: EASE_OUT }} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-start justify-between gap-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={shelf + q}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.75, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl text-sm italic"
              aria-live="polite"
            >
              {q ? `${results.length} ${results.length === 1 ? "volume matches" : "volumes match"} “${query.trim()}”.` : cat ? cat.blurb : "The whole collection, from the sunlit shallows to the trenches."}
            </motion.p>
          </AnimatePresence>
          <div className="hidden shrink-0 gap-1 md:flex" role="group" aria-label="View">
            {(["shelf", "index"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`annot border px-3 py-1.5 uppercase tracking-[0.16em] transition ${view === v ? "border-ivory bg-ivory text-abyss" : "border-ivory/25 hover:border-ivory/60"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shelf view: book spines that slide out to reveal their covers */}
      {view === "shelf" && (
        <div ref={shelfRef} className="no-scrollbar mt-8 hidden overflow-x-auto px-5 pb-6 sm:px-10 md:block lg:px-16" data-scroll>
          <LayoutGroup>
            <motion.ul layout className="flex h-[62vh] min-h-[420px] items-end gap-[3px]">
              <AnimatePresence mode="popLayout">
                {results.map((e, i) => {
                  const isOpen = open === e.slug;
                  return (
                    <motion.li
                      key={e.slug}
                      layout
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0, width: isOpen ? 360 : 68 }}
                      exit={{ opacity: 0, y: 40, transition: { duration: 0.3 } }}
                      transition={{ duration: reduced ? 0 : 0.8, ease: EASE_OUT, delay: reduced ? 0 : Math.min(i, 20) * 0.015 }}
                      onMouseEnter={() => setOpen(e.slug)}
                      onMouseLeave={() => setOpen(null)}
                      className="relative h-full shrink-0"
                      style={{ height: `${86 + ((i * 7) % 14)}%` }}
                    >
                      <Link
                        href={`/creatures/${e.slug}`}
                        onClick={markFromLibrary}
                        onFocus={() => setOpen(e.slug)}
                        onBlur={() => setOpen(null)}
                        className="group relative block h-full overflow-hidden border border-ivory/10"
                        style={{ background: toneFor(e) }}
                        aria-label={`${e.commonName}, ${e.scientificName}. ${e.pageCount} pages.`}
                      >
                        {/* cover image revealed when pulled out */}
                        {e.image && (
                          <motion.div className="absolute inset-0" initial={false} animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 1.15 }} transition={{ duration: 0.9, ease: EASE_OUT }}>
                            <Image src={e.image.src} alt="" fill sizes="360px" className="object-cover" style={{ objectPosition: e.image.focal }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
                          </motion.div>
                        )}
                        {/* spine */}
                        <motion.div className="absolute inset-0 flex flex-col items-center justify-between py-4" initial={false} animate={{ opacity: isOpen ? 0 : 1 }} transition={{ duration: 0.4 }}>
                          <span className="annot opacity-50">{String(i + 1).padStart(2, "0")}</span>
                          <span className="display whitespace-nowrap text-[1.35rem] leading-none [writing-mode:vertical-rl] rotate-180">{e.commonName}</span>
                          <span className="h-px w-6 bg-ivory/30" />
                        </motion.div>
                        {/* cover text */}
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
                          <p className="annot mt-3 opacity-60">{e.pageCount} pages · Open →</p>
                        </motion.div>
                      </Link>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          </LayoutGroup>
          {results.length > 0 && <p className="annot mt-4 opacity-40">Hover a spine to pull it from the shelf · scroll sideways to browse</p>}
        </div>
      )}

      {/* Index view (always on small screens) */}
      <div className={`mt-8 px-5 sm:px-10 lg:px-16 ${view === "shelf" ? "md:hidden" : ""}`}>
        <ul className="grid gap-x-12 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {results.map((e) => (
              <motion.li
                key={e.slug}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link href={`/creatures/${e.slug}`} onClick={markFromLibrary} className="group flex items-center gap-4 border-b border-ivory/10 py-3">
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden" style={{ background: toneFor(e) }}>
                    {e.image && <Image src={e.image.src} alt="" fill sizes="80px" className="object-cover transition duration-700 group-hover:scale-110" style={{ objectPosition: e.image.focal }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="display truncate text-2xl leading-tight transition group-hover:translate-x-1">{e.commonName}</p>
                    <p className="truncate text-xs italic opacity-60">
                      {e.scientificName} · {e.group}
                    </p>
                    {q && matchReason(e, q) && <p className="annot truncate text-biolume">Matched: {matchReason(e, q)}</p>}
                  </div>
                  <span className="annot shrink-0 opacity-40">{e.pageCount} pp.</span>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      {results.length === 0 && (
        <div className="px-5 py-16 text-center sm:px-10">
          <p className="display text-3xl italic opacity-70">Nothing in these waters.</p>
          <button onClick={() => { setQuery(""); setShelf("all"); }} className="eyebrow mt-4 border-b border-ivory/40 pb-1 opacity-70 hover:opacity-100">
            Clear search
          </button>
        </div>
      )}
    </section>
  );
}

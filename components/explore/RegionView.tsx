"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { geoDistance, geoOrthographic, type GeoProjection } from "d3-geo";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { RegionCard } from "@/lib/explore";
import type { CategorySlug } from "@/lib/types";
import { loadDetailedLand, shapeOf } from "@/lib/geo";
import { categoryTitle } from "@/lib/categories";
import { EASE_CINE, EASE_OUT } from "@/lib/motion";
import { markFromLibrary } from "@/components/library/CreatureLibrary";
import { drawEarth, fitCanvas } from "./draw";
import { AnimalCard } from "./AnimalCard";
import { GLOBE_STORE, type GlobeMemory } from "./WorldGlobe";

/* The framing that shows the whole region: centred on it and scaled to fit, within sensible limits. */
function framing(region: RegionCard, w: number, h: number) {
  const [lon, lat] = region.centroid;
  const proj = geoOrthographic().clipAngle(90).rotate([-lon, -lat]);
  const shape = shapeOf(region.slug);
  let scale = Math.min(w, h) * 0.8;
  if (shape) {
    proj.fitExtent([[w * 0.08, h * 0.12], [w * 0.92, h * 0.88]], shape.feature);
    scale = Math.min(proj.scale(), Math.min(w, h) * 9);
  }
  return proj.scale(scale).translate([w / 2, h / 2]);
}

export function RegionView({ region }: { region: RegionCard }) {
  const reduced = !!useReducedMotion();
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLCanvasElement>(null);
  const detailRef = useRef<HTMLCanvasElement>(null);
  const projRef = useRef<GeoProjection | null>(null);
  const [detail, setDetail] = useState<FeatureCollection<MultiPolygon | Polygon> | null>(null);
  const [pins, setPins] = useState<{ slug: string; x: number; y: number }[]>([]);
  const [settled, setSettled] = useState(reduced);
  const [leaving, setLeaving] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const [shelf, setShelf] = useState<CategorySlug | "all">("all");

  const paint = useMemo(
    () => ({
      colourOf: () => region.colour,
      alphaOf: (slug: string) => (slug === region.slug ? 0.8 : 0.16),
    }),
    [region],
  );

  // The 1:50m coastline follows on behind the first frame.
  useEffect(() => {
    let live = true;
    loadDetailedLand().then((land) => live && setDetail(land));
    return () => {
      live = false;
    };
  }, []);

  /* Arrive: the camera finishes the dive begun on the globe, from far out down to the region. */
  useEffect(() => {
    const box = boxRef.current;
    const base = baseRef.current;
    if (!box || !base) return;
    let stop: (() => void) | undefined;
    const render = (k: number) => {
      const { ctx, w, h } = fitCanvas(base);
      const proj = framing(region, w, h);
      proj.scale(proj.scale() * k);
      projRef.current = proj;
      ctx.clearRect(0, 0, w, h);
      drawEarth(ctx, proj, paint);
      if (region.realm === "ocean") {
        const [x, y] = proj(region.centroid)!;
        const g = ctx.createRadialGradient(x, y, 0, x, y, Math.min(w, h) * 0.5);
        g.addColorStop(0, "rgba(142,240,228,0.25)");
        g.addColorStop(1, "rgba(142,240,228,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    };
    const place = () => {
      const proj = projRef.current;
      if (!proj) return;
      const rot = proj.rotate();
      const centre: [number, number] = [-rot[0], -rot[1]];
      setPins(
        region.animals
          .filter((a) => a.pin && geoDistance(a.pin, centre) < Math.PI / 2)
          .map((a) => {
            const [x, y] = proj(a.pin!)!;
            return { slug: a.slug, x, y };
          }),
      );
    };
    if (reduced) {
      // `settled` already starts true when motion is reduced.
      render(1);
      place();
    } else {
      const c = animate(0.12, 1, {
        duration: 1.5,
        ease: EASE_CINE,
        onUpdate: render,
        onComplete: () => {
          place();
          setSettled(true);
        },
      });
      stop = () => c.stop();
    }
    const ro = new ResizeObserver(() => {
      render(1);
      place();
    });
    ro.observe(box);
    return () => {
      stop?.();
      ro.disconnect();
      // The router may keep this page alive while hidden; come back to it whole.
      setLeaving(false);
    };
  }, [region, paint, reduced]);

  // Detail layer, drawn over the base at the settled framing, then faded in.
  useEffect(() => {
    const canvas = detailRef.current;
    if (!canvas || !detail || !settled) return;
    const { ctx, w, h } = fitCanvas(canvas);
    const proj = framing(region, w, h);
    ctx.clearRect(0, 0, w, h);
    drawEarth(ctx, proj, { ...paint, land: detail, sphere: false });
  }, [detail, settled, region, paint]);

  /* Leave: pull back out, and tell the globe where to resume. */
  const back = () => {
    const [lon, lat] = region.centroid;
    try {
      sessionStorage.setItem(GLOBE_STORE, JSON.stringify({ rot: [-lon, Math.max(-75, Math.min(75, -lat))], k: 1, from: region.slug } satisfies GlobeMemory));
    } catch {}
    if (reduced) return router.push("/explore");
    setLeaving(true);
    const base = baseRef.current!;
    animate(1, 0.15, {
      duration: 0.8,
      ease: EASE_CINE,
      onUpdate: (k) => {
        const { ctx, w, h } = fitCanvas(base);
        const proj = framing(region, w, h);
        proj.scale(proj.scale() * k);
        ctx.clearRect(0, 0, w, h);
        drawEarth(ctx, proj, paint);
      },
      onComplete: () => router.push("/explore"),
    });
  };

  const shelves = useMemo(() => {
    const set = new Set(region.animals.flatMap((a) => a.categories));
    return [...set];
  }, [region]);
  const shown = shelf === "all" ? region.animals : region.animals.filter((a) => a.categories.includes(shelf));
  const documented = region.animals.filter((a) => a.documented).length;
  const byslug = new Map(region.animals.map((a) => [a.slug, a]));

  const openPin = (slug: string) => {
    const a = byslug.get(slug);
    if (a?.documented) {
      markFromLibrary();
      router.push(`/creatures/${slug}`);
    } else {
      const el = document.getElementById(`card-${slug}`);
      el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      (el?.querySelector("a,button") as HTMLElement | null)?.focus({ preventScroll: true });
    }
  };

  return (
    <main className="min-h-dvh bg-[#041120] text-ivory">
      <section ref={boxRef} className="relative h-[72dvh] min-h-[440px] overflow-hidden">
        <canvas ref={baseRef} className="absolute inset-0 h-full w-full" role="img" aria-label={`Map of ${region.name}${pins.length ? ", with the places its animals live" : ""}`} />
        <motion.canvas
          ref={detailRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: detail && settled && !leaving ? 1 : 0 }}
          transition={{ duration: leaving ? 0.15 : 1.2, ease: EASE_OUT }}
        />

        {/* Pins: where each animal can be found */}
        <div className="absolute inset-0">
          <AnimatePresence>
            {settled &&
              !leaving &&
              pins.map((p, i) => {
                const a = byslug.get(p.slug)!;
                const on = hot === p.slug;
                return (
                  <motion.button
                    key={p.slug}
                    type="button"
                    onClick={() => openPin(p.slug)}
                    onPointerEnter={() => setHot(p.slug)}
                    onPointerLeave={() => setHot(null)}
                    onFocus={() => setHot(p.slug)}
                    onBlur={() => setHot(null)}
                    aria-label={`${a.commonName}${a.documented ? "" : " — documentary coming soon"}`}
                    className="absolute -ml-2.5 -mt-2.5 flex h-5 w-5 items-center justify-center"
                    style={{ left: p.x, top: p.y, zIndex: on ? 10 : 1 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={reduced ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 18, delay: 0.1 + i * 0.05 }}
                  >
                    {!reduced && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-ivory/30 [animation-duration:2.4s]" />}
                    <span aria-hidden className={`relative block rounded-full border border-ink/60 transition-all ${on ? "h-3.5 w-3.5 bg-ivory" : "h-2.5 w-2.5"} ${a.documented ? "bg-ivory" : "bg-sand"}`} />
                    <AnimatePresence>
                      {on && (
                        <motion.span
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="display pointer-events-none absolute bottom-full mb-2 whitespace-nowrap border border-ivory/20 bg-black/75 px-2.5 py-1 text-sm italic"
                        >
                          {a.commonName}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#041120] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#041120]/85 to-transparent" />

        <header className="absolute inset-x-0 top-0 flex items-start justify-between px-4 pt-4 sm:px-8 sm:pt-6">
          <button type="button" onClick={back} className="eyebrow inline-flex items-center gap-2 border-b border-ivory/40 pb-1 transition hover:border-ivory">
            <span aria-hidden>←</span> The globe
          </button>
          <Link href="/" className="eyebrow opacity-60 transition hover:opacity-100">
            The Wild Book
          </Link>
        </header>

        <motion.div
          className="absolute bottom-6 left-4 max-w-xl sm:left-8 lg:left-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: leaving ? 0 : 1, y: 0 }}
          transition={{ duration: 0.9, delay: reduced || leaving ? 0 : 0.9, ease: EASE_OUT }}
        >
          <span className="annot inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.18em] opacity-75">
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: region.colour }} />
            {region.biomeName}
          </span>
          <h1 className="display mt-2 text-[clamp(2.6rem,7vw,6rem)] italic leading-[0.95]">{region.name}</h1>
          <p className="lede mt-3 max-w-md opacity-80">{region.line}</p>
        </motion.div>

        {/* The dive's last moment: sea colour clears to reveal the map */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[#041120]"
          initial={{ opacity: reduced ? 0 : 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        />
      </section>

      <motion.section
        className="relative px-4 pb-24 pt-6 sm:px-8 lg:px-16"
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        aria-label={`Animals of ${region.name}`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-ivory/12 pb-4">
          <p className="annot text-[0.65rem] uppercase tracking-[0.18em] opacity-60">
            {region.animals.length} species · {documented} {documented === 1 ? "documentary" : "documentaries"}
          </p>
          {shelves.length > 0 && (
            <div className="no-scrollbar -mx-4 flex gap-x-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter by shelf">
              {(["all", ...shelves] as const).map((k, i) => {
                const on = shelf === k;
                return (
                  <span key={k} className="inline-flex shrink-0 items-baseline">
                    {i > 0 && <span aria-hidden className="mx-2 opacity-30">·</span>}
                    <button role="tab" aria-selected={on} onClick={() => setShelf(k)} className={`relative pb-1 transition ${on ? "opacity-100" : "opacity-55 hover:opacity-90"}`}>
                      <span className="display text-lg italic">{k === "all" ? "All" : categoryTitle(k)}</span>
                      {on && <motion.span layoutId="region-shelf" className="absolute inset-x-0 bottom-0 h-px bg-ivory" transition={{ duration: 0.5, ease: EASE_OUT }} />}
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <motion.ul layout className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {shown.map((a, i) => (
              <motion.li
                key={a.slug}
                id={`card-${a.slug}`}
                layout
                className="aspect-[3/4]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: reduced ? 0.2 : 0.7, delay: reduced ? 0 : Math.min(i, 10) * 0.04, ease: EASE_OUT }}
              >
                <AnimalCard a={a} size="lg" highlight={hot === a.slug} onHover={setHot} onPick={() => setHot(a.slug)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </motion.section>
    </main>
  );
}

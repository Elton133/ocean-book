"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { geoDistance, geoOrthographic } from "d3-geo";
import type { RegionCard } from "@/lib/explore";
import type { RegionSlug } from "@/lib/types";
import { regionAt, wrapDelta } from "@/lib/geo";
import { EASE_CINE, EASE_OUT } from "@/lib/motion";
import { drawEarth, fitCanvas, starfield } from "./draw";
import { AnimalCard } from "./AnimalCard";

/** Session key: where the globe was turned to, and which region the reader zoomed into. */
export const GLOBE_STORE = "ob:globe";
export interface GlobeMemory {
  rot: [number, number];
  k: number;
  from?: string;
}

const MAX_TILT = 75;
const IDLE_MS = 4000;
const tilt = (v: number) => Math.max(-MAX_TILT, Math.min(MAX_TILT, v));

/* Globe placement: off-centre beside the region list on wide screens, high on phones to leave room for the panel. */
function layout(w: number, h: number) {
  const wide = w >= 1024;
  const R = wide ? Math.min(w * 0.27, h * 0.36) : Math.min(w * 0.4, h * 0.27);
  return { cx: wide ? w * 0.45 : w / 2, cy: wide ? h * 0.53 : h * 0.4, R, wide };
}

export default function WorldGlobe({ regions }: { regions: RegionCard[] }) {
  const reduced = !!useReducedMotion();
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const flight = useRef<AnimationPlaybackControls | null>(null);
  const byslug = useMemo(() => new Map(regions.map((r) => [r.slug, r])), [regions]);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [selected, setSelected] = useState<RegionSlug | null>(null);
  const [hover, setHover] = useState<RegionSlug | null>(null);
  const [leaving, setLeaving] = useState(false);

  // Everything the frame loop reads lives in one mutable record, so dragging never re-renders React.
  const s = useRef({
    rot: [-20, -12] as [number, number],
    k: 1,
    vel: [0, 0] as [number, number],
    dragging: false,
    flying: false,
    lastInput: -Infinity,
    pulse: 0,
    dirty: true,
    selected: null as RegionSlug | null,
    hover: null as RegionSlug | null,
    pointers: new Map<number, { x: number; y: number }>(),
    start: { x: 0, y: 0, t: 0, moved: 0 },
    pinch: { d: 0, k: 1 },
    stars: null as HTMLCanvasElement | null,
    proj: geoOrthographic().clipAngle(90),
    geom: { cx: 0, cy: 0, R: 1, wide: true },
  });

  /* Turn the globe so a point faces the reader. */
  const flyTo = useCallback(
    ([lon, lat]: [number, number]) => {
      const st = s.current;
      const from = [...st.rot] as [number, number];
      const to: [number, number] = [from[0] + wrapDelta(from[0], -lon), tilt(-lat)];
      flight.current?.stop();
      st.vel = [0, 0];
      if (reduced) {
        st.rot = to;
        st.dirty = true;
        return;
      }
      st.flying = true;
      flight.current = animate(0, 1, {
        duration: 0.9,
        ease: EASE_CINE,
        onUpdate: (t) => {
          st.rot = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
          st.dirty = true;
        },
        onComplete: () => (st.flying = false),
      });
    },
    [reduced],
  );

  const select = useCallback(
    (slug: RegionSlug | null, fly = true) => {
      const st = s.current;
      st.selected = slug;
      st.dirty = true;
      setSelected(slug);
      if (!slug) return;
      st.pulse = 1;
      const r = byslug.get(slug);
      if (r && fly) flyTo(r.centroid);
      router.prefetch(`/explore/${slug}`);
    },
    [byslug, flyTo, router],
  );

  /* The camera dives into the region, then the region page takes over from the same framing. */
  const zoomInto = useCallback(
    (slug: RegionSlug) => {
      const st = s.current;
      try {
        sessionStorage.setItem(GLOBE_STORE, JSON.stringify({ rot: st.rot, k: st.k, from: slug } satisfies GlobeMemory));
      } catch {}
      if (reduced) return router.push(`/explore/${slug}`);
      setLeaving(true);
      flight.current?.stop();
      const r = byslug.get(slug);
      const from = [...st.rot] as [number, number];
      const to: [number, number] = r ? [from[0] + wrapDelta(from[0], -r.centroid[0]), tilt(-r.centroid[1])] : from;
      const k0 = st.k;
      st.flying = true;
      flight.current = animate(0, 1, {
        duration: 1,
        ease: EASE_CINE,
        onUpdate: (t) => {
          st.k = k0 * (1 + 5 * t * t);
          st.rot = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
          st.dirty = true;
        },
        onComplete: () => router.push(`/explore/${slug}`),
      });
    },
    [byslug, reduced, router],
  );

  /* Coming back from a region: start zoomed in on it and pull back out to the globe.
     The router keeps this page alive while hidden, so the dive is undone on the way out. */
  useEffect(() => {
    const reset = () => setLeaving(false);
    let saved: GlobeMemory | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(GLOBE_STORE) ?? "null");
      if (saved?.from) sessionStorage.setItem(GLOBE_STORE, JSON.stringify({ ...saved, from: undefined }));
    } catch {}
    if (!saved) return reset;
    const st = s.current;
    st.rot = saved.rot;
    st.k = saved.k;
    st.dirty = true;
    const from = saved.from && byslug.has(saved.from as RegionSlug) ? (saved.from as RegionSlug) : null;
    if (!from) return reset;
    select(from, false);
    if (reduced) return reset;
    st.k = saved.k * 6;
    st.flying = true;
    flight.current = animate(saved.k * 6, saved.k, {
      duration: 1.2,
      ease: EASE_OUT,
      onUpdate: (k) => {
        st.k = k;
        st.dirty = true;
      },
      onComplete: () => (st.flying = false),
    });
    return () => {
      flight.current?.stop();
      st.flying = false;
      reset();
    };
  }, [byslug, reduced, select]);

  /* Size, stars and the frame loop. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const st = s.current;
    let ctx: CanvasRenderingContext2D;
    let w = 0,
      h = 0;
    const resize = () => {
      const fit = fitCanvas(canvas);
      ({ ctx, w, h } = fit);
      st.stars = starfield(w, h, fit.dpr);
      st.geom = layout(w, h);
      st.dirty = true;
      setSize({ w, h });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = () => {
      const { cx, cy, R } = st.geom;
      const proj = st.proj.translate([cx, cy]).scale(R * st.k).rotate([st.rot[0], st.rot[1]]);
      ctx.clearRect(0, 0, w, h);
      if (st.stars) ctx.drawImage(st.stars, 0, 0, w, h);
      const sel = st.selected;
      drawEarth(ctx, proj, {
        colourOf: (slug) => byslug.get(slug)?.colour ?? "#999",
        alphaOf: (slug) => {
          if (slug === sel) return 0.78 + 0.22 * st.pulse;
          if (slug === st.hover) return 0.72;
          return sel ? 0.22 : 0.42;
        },
      });
      const centre: [number, number] = [-st.rot[0], -st.rot[1]];
      const facing = (p: [number, number]) => geoDistance(p, centre) < Math.PI / 2 - 0.04;
      // Islands too small for the coastline get a ring of their own.
      const gal = byslug.get("galapagos");
      if (gal && facing(gal.centroid)) {
        const [x, y] = proj(gal.centroid)!;
        ctx.beginPath();
        ctx.arc(x, y, 4 + (sel === "galapagos" ? 3 * st.pulse : 0), 0, Math.PI * 2);
        ctx.strokeStyle = gal.colour;
        ctx.lineWidth = sel === "galapagos" || st.hover === "galapagos" ? 2.5 : 1.5;
        ctx.stroke();
      }
      const r = sel ? byslug.get(sel) : null;
      if (r && r.realm === "ocean" && facing(r.centroid)) {
        const [x, y] = proj(r.centroid)!;
        const g = ctx.createRadialGradient(x, y, 0, x, y, R * st.k * 0.45);
        g.addColorStop(0, `rgba(142,240,228,${0.22 + 0.25 * st.pulse})`);
        g.addColorStop(1, "rgba(142,240,228,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, R * st.k * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      // Where the selected region's animals were seen.
      if (r) {
        for (const a of r.animals) {
          if (!a.pin || !facing(a.pin)) continue;
          const [x, y] = proj(a.pin)!;
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "#fbf7ee";
          ctx.fill();
          ctx.strokeStyle = "rgba(21,23,27,0.6)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    };

    let raf = 0;
    const frame = (t: number) => {
      if (!st.dragging && !st.flying) {
        if (!reduced && Math.abs(st.vel[0]) + Math.abs(st.vel[1]) > 0.005) {
          st.rot = [st.rot[0] + st.vel[0], tilt(st.rot[1] + st.vel[1])];
          st.vel = [st.vel[0] * 0.94, st.vel[1] * 0.94];
          st.dirty = true;
        } else if (!reduced && !st.selected && t - st.lastInput > IDLE_MS) {
          st.rot = [st.rot[0] + 0.06, st.rot[1]];
          st.dirty = true;
        }
      }
      if (st.pulse > 0) {
        st.pulse = Math.max(0, st.pulse - 0.012);
        st.dirty = true;
      }
      if (st.dirty) {
        st.dirty = false;
        draw();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      st.k = Math.max(0.75, Math.min(2.4, st.k * Math.exp(-e.deltaY * 0.0015)));
      st.lastInput = performance.now();
      st.dirty = true;
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [byslug, reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [select]);

  /* Pointer: drag to turn, flick for inertia, pinch to zoom, tap to choose. */
  const local = (e: React.PointerEvent) => {
    const b = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  };
  const pick = (x: number, y: number): RegionSlug | null => {
    const { cx, cy, R } = s.current.geom;
    if (Math.hypot(x - cx, y - cy) > R * s.current.k) return null;
    const p = s.current.proj.invert?.([x, y]);
    return p ? regionAt(p as [number, number]) : null;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const st = s.current;
    const p = local(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    st.pointers.set(e.pointerId, p);
    flight.current?.stop();
    st.flying = false;
    st.vel = [0, 0];
    st.lastInput = performance.now();
    if (st.pointers.size === 2) {
      const [a, b] = [...st.pointers.values()];
      st.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: st.k };
      st.start.moved = Infinity;
    } else {
      st.dragging = true;
      st.start = { ...p, t: performance.now(), moved: 0 };
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const st = s.current;
    const p = local(e);
    const prev = st.pointers.get(e.pointerId);
    if (prev) {
      st.pointers.set(e.pointerId, p);
      st.lastInput = performance.now();
      if (st.pointers.size === 2) {
        const [a, b] = [...st.pointers.values()];
        st.k = Math.max(0.75, Math.min(2.4, (st.pinch.k * Math.hypot(a.x - b.x, a.y - b.y)) / (st.pinch.d || 1)));
        st.dirty = true;
        return;
      }
      const dx = p.x - prev.x;
      const dy = p.y - prev.y;
      st.start.moved += Math.abs(dx) + Math.abs(dy);
      const sens = 57.3 / (st.geom.R * st.k);
      st.rot = [st.rot[0] + dx * sens, tilt(st.rot[1] - dy * sens)];
      st.vel = [st.vel[0] * 0.5 + dx * sens * 0.5, st.vel[1] * 0.5 - dy * sens * 0.5];
      st.dirty = true;
      return;
    }
    if (e.pointerType !== "mouse") return;
    const slug = pick(p.x, p.y);
    if (labelRef.current) labelRef.current.style.transform = `translate(${p.x + 16}px, ${p.y + 14}px)`;
    if (slug !== st.hover) {
      st.hover = slug;
      st.dirty = true;
      setHover(slug);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const st = s.current;
    st.pointers.delete(e.pointerId);
    if (st.pointers.size > 0) return;
    st.dragging = false;
    st.lastInput = performance.now();
    if (st.start.moved < 6 && performance.now() - st.start.t < 500) {
      st.vel = [0, 0];
      const p = local(e);
      select(pick(p.x, p.y));
    }
  };

  const onPointerLeave = () => {
    s.current.hover = null;
    s.current.dirty = true;
    setHover(null);
  };

  const region = selected ? byslug.get(selected) : null;
  const { cx, cy, R, wide } = layout(size.w, size.h);
  const cards = region ? region.animals.slice(0, size.w < 640 ? 3 : 5) : [];
  const cw = size.w < 640 ? 104 : 140;
  const ch = size.w < 640 ? 142 : 186;
  const ring = R * (size.w < 640 ? 1.05 : 1.12);
  const land = regions.filter((r) => r.realm === "land");
  const seas = regions.filter((r) => r.realm === "ocean");
  const hovered = hover ? byslug.get(hover) : null;

  return (
    <div ref={wrapRef} className="fixed inset-0 overflow-hidden bg-[#02050a] text-ivory">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
        role="img"
        aria-label="Interactive globe. Drag to turn the Earth and tap a region, or choose a region from the list, to see the animals that live there."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
      />

      {/* Hover label follows the cursor */}
      <div ref={labelRef} className="pointer-events-none absolute left-0 top-0 z-20" aria-hidden>
        <AnimatePresence>
          {hovered && !leaving && (
            <motion.div
              key={hovered.slug}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="whitespace-nowrap border border-ivory/20 bg-black/70 px-3 py-1.5 backdrop-blur"
            >
              <span className="display text-base italic">{hovered.name}</span>
              <span className="annot ml-2 text-[0.55rem] uppercase tracking-[0.16em] opacity-60">{hovered.biomeName}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Running head */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="pointer-events-auto">
          <Link href="/" className="eyebrow opacity-70 transition hover:opacity-100">
            The Wild Book
          </Link>
          <h1 className="display mt-2 text-[clamp(2rem,4.2vw,3.6rem)] italic leading-none">The Living World</h1>
          <p className={`mt-2 max-w-xs text-sm transition-opacity duration-500 ${region ? "opacity-0 lg:opacity-60" : "opacity-60"}`}>
            Drag to turn the Earth. Tap a region to meet the animals that live there.
          </p>
        </div>
      </header>

      {/* Cards burst from the region, now at the centre of the globe */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <AnimatePresence>
          {region &&
            !leaving &&
            cards.map((a, i) => {
              const n = cards.length;
              const ang = ((-168 + (156 * (i + 0.5)) / n) * Math.PI) / 180;
              const x = Math.max(8, Math.min(size.w - cw - 8, cx + Math.cos(ang) * ring - cw / 2));
              const y = Math.max(wide ? 150 : 120, cy + Math.sin(ang) * ring - ch / 2);
              const lean = (i - (n - 1) / 2) * 4;
              const home = { x: cx - cw / 2, y: cy - ch / 2, scale: 0.15, opacity: 0, rotate: 0 };
              return (
                <motion.div
                  key={`${region.slug}-${a.slug}`}
                  className="pointer-events-auto absolute left-0 top-0"
                  style={{ width: cw, height: ch }}
                  initial={reduced ? { x, y, opacity: 0, scale: 1, rotate: lean } : home}
                  animate={{ x, y, opacity: 1, scale: 1, rotate: lean }}
                  exit={reduced ? { opacity: 0 } : { ...home, transition: { duration: 0.4, ease: EASE_CINE, delay: (n - 1 - i) * 0.03 } }}
                  transition={reduced ? { duration: 0.25 } : { type: "spring", stiffness: 160, damping: 17, delay: 0.45 + i * 0.06 }}
                  whileHover={reduced ? undefined : { y: y - 6, rotate: 0, transition: { duration: 0.3 } }}
                >
                  <AnimalCard a={a} size="sm" onPick={() => zoomInto(region.slug)} />
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Region panel */}
      <AnimatePresence>
        {region && !leaving && (
          <motion.section
            key={region.slug}
            aria-live="polite"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: reduced ? 0.2 : 0.6, ease: EASE_OUT }}
            className="absolute inset-x-3 bottom-20 z-30 border border-ivory/15 bg-black/65 p-5 backdrop-blur-md sm:inset-x-auto sm:left-8 sm:w-[24rem] lg:bottom-8"
          >
            <span className="annot inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.18em] opacity-70">
              <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: region.colour }} />
              {region.biomeName}
            </span>
            <h2 className="display mt-2 text-3xl italic leading-tight sm:text-4xl">{region.name}</h2>
            <p className="mt-2 text-sm leading-relaxed opacity-75">{region.line}</p>
            <p className="annot mt-3 text-[0.6rem] uppercase tracking-[0.16em] opacity-55">
              {region.animals.length} species · {region.animals.filter((a) => a.documented).length} documentaries
            </p>
            <div className="mt-4 flex items-center gap-5">
              <button
                type="button"
                onClick={() => zoomInto(region.slug)}
                className="eyebrow inline-flex items-center gap-2 border-b border-ivory/60 pb-1 transition hover:border-ivory"
              >
                Zoom into {region.name} <span aria-hidden>→</span>
              </button>
              <button type="button" onClick={() => select(null)} className="eyebrow opacity-60 transition hover:opacity-100">
                Close
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* The same journey without dragging: every region as a list */}
      <nav
        aria-label="Regions"
        className="absolute inset-x-0 bottom-0 z-20 border-t border-ivory/10 bg-black/40 backdrop-blur lg:inset-x-auto lg:bottom-auto lg:right-0 lg:top-0 lg:h-full lg:w-64 lg:border-l lg:border-t-0"
      >
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-3 py-3 lg:h-full lg:flex-col lg:gap-0 lg:overflow-y-auto lg:px-6 lg:pb-8 lg:pt-28">
          {[
            ["Land", land],
            ["Sea", seas],
          ].map(([label, list]) => (
            <div key={label as string} className="flex shrink-0 gap-1 lg:block">
              <p className="annot hidden pb-2 pt-5 text-[0.55rem] uppercase tracking-[0.2em] opacity-45 lg:block">{label as string}</p>
              {(list as RegionCard[]).map((r) => {
                const on = selected === r.slug;
                return (
                  <button
                    key={r.slug}
                    type="button"
                    onClick={() => select(on ? null : r.slug)}
                    onPointerEnter={() => {
                      s.current.hover = r.slug;
                      s.current.dirty = true;
                    }}
                    onPointerLeave={() => {
                      s.current.hover = null;
                      s.current.dirty = true;
                    }}
                    aria-pressed={on}
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap px-2 py-1.5 text-left transition lg:w-full lg:whitespace-normal lg:px-0 ${on ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
                  >
                    <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: r.colour }} />
                    <span className={`display text-base italic leading-tight ${on ? "underline decoration-1 underline-offset-4" : ""}`}>{r.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </nav>

      {/* The dive: the screen fills with sea as the camera reaches the region */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40 bg-[#041120]"
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 1 : 0 }}
        transition={{ duration: 0.6, delay: leaving ? 0.45 : 0, ease: EASE_CINE }}
      />
    </div>
  );
}

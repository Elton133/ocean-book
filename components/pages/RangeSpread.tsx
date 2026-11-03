"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { animate } from "framer-motion";
import { geoOrthographic } from "d3-geo";
import type { PageProps } from "@/components/book/BookPage";
import type { RegionSlug } from "@/lib/types";
import { biomeBySlug, regionBySlug } from "@/lib/world";
import { EASE_CINE } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";
import { Reveal } from "@/components/motion/Reveal";
import { MarineSnow } from "@/components/media/Media";
import { drawEarth, fitCanvas } from "@/components/explore/draw";
import { ChapterMark, PageFrame, PageTitle, Side } from "./Frame";

/** A small Earth that turns to the animal's home and keeps slowly spinning, its regions lit. */
export function MiniGlobe({ regions, colour }: { regions: RegionSlug[]; colour: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { active, reduced, delay } = usePageMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const home = regionBySlug(regions[0])?.centroid ?? [0, 0];
    const proj = geoOrthographic().clipAngle(90);
    const lit = new Set(regions);
    let rot: [number, number] = [-home[0] - (reduced ? 0 : 140), -home[1] * 0.6];
    const draw = () => {
      const { ctx, w, h } = fitCanvas(canvas);
      proj.translate([w / 2, h / 2]).scale(Math.min(w, h) * 0.44).rotate(rot);
      ctx.clearRect(0, 0, w, h);
      drawEarth(ctx, proj, { colourOf: () => colour, alphaOf: (s) => (lit.has(s) ? 0.85 : 0.08) });
    };
    draw();
    if (!active || reduced) return;
    let raf = 0;
    const from = rot[0];
    const c = animate(0, 1, {
      duration: 2.4,
      delay,
      ease: EASE_CINE,
      onUpdate: (t) => {
        rot = [from + 140 * t, rot[1]];
        draw();
      },
      onComplete: () => {
        // Then a drift slow enough to read by.
        const spin = () => {
          rot = [rot[0] + 0.04, rot[1]];
          draw();
          raf = requestAnimationFrame(spin);
        };
        raf = requestAnimationFrame(spin);
      },
    });
    window.addEventListener("resize", draw);
    return () => {
      c.stop();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", draw);
    };
  }, [regions, colour, active, reduced, delay]);

  return <canvas ref={ref} className="aspect-square w-full max-w-md" role="img" aria-label={`Globe highlighting where it lives: ${regions.map((r) => regionBySlug(r)?.name).join(", ")}`} />;
}

/* Its world, on land: where it lives and how high --------------------- */
export function RangeSpread({ book, page }: PageProps) {
  const c = book.creature;
  if (c.realm !== "land") return null;
  const biome = biomeBySlug(c.biome);
  const rows: [string, string | undefined][] = [
    ["Where", c.stats.range],
    ["Habitat", c.stats.habitat],
    ["How high", c.stats.elevation],
    ["What it eats", c.stats.diet],
  ];
  return (
    <div className="absolute inset-0">
      <MarineSnow density={40} className="opacity-60" air />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-6 lg:justify-start">
            <ChapterMark chapter={page.chapter} label={biome.name} />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3.2rem,7vw,7rem)]" />
            <dl className="mt-8 grid max-w-xl gap-6">
              {rows
                .filter(([, v]) => v)
                .map(([k, v], i) => (
                  <Reveal key={k} delay={0.7 + i * 0.15} className="grid grid-cols-[7rem_1fr] gap-4 border-t border-ivory/15 pt-3">
                    <dt className="annot uppercase tracking-[0.18em] opacity-50">{k}</dt>
                    <dd className="lede opacity-90">{v}</dd>
                  </Reveal>
                ))}
            </dl>
            <Reveal delay={1.4} className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {c.regions.map((r) => (
                <Link key={r} href={`/explore/${r}`} data-no-drag className="eyebrow inline-flex items-center gap-2 border-b border-ivory/40 pb-1 transition hover:border-ivory">
                  Explore {regionBySlug(r)?.name} <span aria-hidden>→</span>
                </Link>
              ))}
            </Reveal>
          </Side>
          <Side part="b" className="flex items-center justify-center lg:col-span-6">
            <MiniGlobe regions={c.regions} colour={biome.colour} />
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

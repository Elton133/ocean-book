import { geoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { GRATICULE, LAND, REGION_SHAPES_LIST } from "@/lib/geo";
import type { RegionSlug } from "@/lib/types";

export interface EarthStyle {
  /** Tint strength for a land region, 0 to hide it. */
  alphaOf: (slug: RegionSlug) => number;
  colourOf: (slug: RegionSlug) => string;
  land?: FeatureCollection<MultiPolygon | Polygon>;
  /** Overall opacity of the land layer, for cross-fading coastlines of two resolutions. */
  landAlpha?: number;
  /** Draw the haze, ocean and shading — off for a detail layer drawn over a base. */
  sphere?: boolean;
}

/**
 * The Earth as an illustrated plate: dark sea, paper-coloured land, biome
 * tints laid on the land only, and a soft shading that rounds the sphere.
 */
export function drawEarth(ctx: CanvasRenderingContext2D, proj: GeoProjection, style: EarthStyle) {
  const { alphaOf, colourOf, land = LAND, landAlpha = 1, sphere = true } = style;
  const path = geoPath(proj, ctx);
  const [cx, cy] = proj.translate();
  const r = proj.scale();

  if (sphere) {
    // Atmosphere: a faint rim of light just outside the limb.
    const haze = ctx.createRadialGradient(cx, cy, r * 0.96, cx, cy, r * 1.18);
    haze.addColorStop(0, "rgba(111,214,200,0.22)");
    haze.addColorStop(1, "rgba(111,214,200,0)");
    ctx.fillStyle = haze;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.18, 0, Math.PI * 2);
    ctx.fill();

    const sea = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
    sea.addColorStop(0, "#17506f");
    sea.addColorStop(0.55, "#0b2c46");
    sea.addColorStop(1, "#041120");
    ctx.beginPath();
    path({ type: "Sphere" });
    ctx.fillStyle = sea;
    ctx.fill();

    ctx.beginPath();
    path(GRATICULE);
    ctx.strokeStyle = "rgba(239,232,218,0.07)";
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  ctx.save();
  ctx.globalAlpha = landAlpha;
  ctx.beginPath();
  path(land);
  ctx.fillStyle = "#ddd3bd";
  ctx.fill();
  ctx.clip();
  for (const s of REGION_SHAPES_LIST) {
    const a = alphaOf(s.slug);
    if (a <= 0) continue;
    ctx.globalAlpha = a * landAlpha;
    ctx.beginPath();
    path(s.feature);
    ctx.fillStyle = colourOf(s.slug);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = landAlpha;
  ctx.beginPath();
  path(land);
  ctx.strokeStyle = "rgba(21,23,27,0.28)";
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.restore();

  if (sphere) {
    const shade = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.15, cx, cy, r * 1.02);
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(0.7, "rgba(0,0,0,0.12)");
    shade.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.beginPath();
    path({ type: "Sphere" });
    ctx.fillStyle = shade;
    ctx.fill();
    ctx.strokeStyle = "rgba(142,240,228,0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/** A scatter of faint stars, painted once per size and reused every frame. */
export function starfield(w: number, h: number, dpr: number) {
  const c = document.createElement("canvas");
  c.width = w * dpr;
  c.height = h * dpr;
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  const n = Math.round((w * h) / 7000);
  for (let i = 0; i < n; i++) {
    const s = Math.random();
    ctx.fillStyle = `rgba(239,232,218,${0.12 + s * s * 0.6})`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, 0.3 + s * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

/** Fit a canvas to its box at device resolution. */
export function fitCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h, dpr };
}

import { geoArea, geoContains, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryObject } from "topojson-specification";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import land110 from "world-atlas/land-110m.json";
import { REGION_SHAPES } from "@/data/region-shapes";
import type { RegionSlug } from "./types";
import { oceanAt } from "./world";

type LandTopo = Topology<{ land: GeometryObject }>;

const toLand = (topo: LandTopo) => feature(topo, topo.objects.land) as unknown as FeatureCollection<MultiPolygon | Polygon>;

export const LAND = toLand(land110 as unknown as LandTopo);
export const GRATICULE = geoGraticule10();

/** The 1:50m coastline, fetched only when a region is opened up close. */
export const loadDetailedLand = () => import("world-atlas/land-50m.json").then((m) => toLand(m.default as unknown as LandTopo));

export interface RegionShape {
  slug: RegionSlug;
  feature: Feature<MultiPolygon>;
  /** Steradians; small regions are hit-tested even off the coastline. */
  area: number;
}

/*
 * d3 reads a ring's winding to decide which side is inside, so each ring is
 * closed and turned to enclose the smaller side — what the hand tracing meant.
 */
function shape(slug: RegionSlug, rings: [number, number][][]): RegionShape {
  const polys = rings.map((ring) => {
    const closed = [...ring, ring[0]];
    const f: Feature<Polygon> = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [closed] } };
    if (geoArea(f) > 2 * Math.PI) closed.reverse();
    return [closed];
  });
  const f: Feature<MultiPolygon> = { type: "Feature", properties: { slug }, geometry: { type: "MultiPolygon", coordinates: polys } };
  return { slug, feature: f, area: geoArea(f) };
}

/** Largest first, so smaller regions draw on top and win the hit test. */
export const REGION_SHAPES_LIST: RegionShape[] = (Object.entries(REGION_SHAPES) as [RegionSlug, [number, number][][]][])
  .map(([slug, rings]) => shape(slug, rings))
  .sort((a, b) => b.area - a.area);

export const shapeOf = (slug: RegionSlug) => REGION_SHAPES_LIST.find((s) => s.slug === slug);

const SMALL = 0.002;

/** The region under a point on the globe: a land region, or else the ocean basin. */
export function regionAt(p: [number, number]): RegionSlug {
  const onLand = geoContains(LAND, p);
  for (let i = REGION_SHAPES_LIST.length - 1; i >= 0; i--) {
    const s = REGION_SHAPES_LIST[i];
    if ((onLand || s.area < SMALL) && geoContains(s.feature, p)) return s.slug;
  }
  return oceanAt(p[0], p[1]);
}

/** Shortest way round from one longitude to another, so the globe never spins the long way. */
export function wrapDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

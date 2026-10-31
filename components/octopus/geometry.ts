export type Pt = [number, number];
export type Bezier = [Pt, Pt, Pt, Pt];

export function bez([p0, p1, p2, p3]: Bezier, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

export function bezTangent([p0, p1, p2, p3]: Bezier, t: number): Pt {
  const u = 1 - t;
  const x = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const y = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
}

export const bezPath = ([p0, p1, p2, p3]: Bezier) =>
  `M${p0[0]},${p0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`;

/** Outline of a tapered tentacle around a bezier centreline. */
export function taperedPath(curve: Bezier, w0: number, w1: number, steps = 36) {
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = bez(curve, t);
    const [tx, ty] = bezTangent(curve, t);
    const w = (w0 + (w1 - w0) * Math.pow(t, 0.8)) / 2;
    left.push([x - ty * w, y + tx * w]);
    right.push([x + ty * w, y - tx * w]);
  }
  const tip = bez(curve, 1);
  const pts = [...left, tip, ...right.reverse()];
  return "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L") + " Z";
}

/** Points along one side of a curve, for suckers. */
export function suckerPoints(curve: Bezier, w0: number, w1: number, count: number, side = 1, from = 0.12, to = 0.94) {
  const out: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = from + ((to - from) * i) / (count - 1);
    const [x, y] = bez(curve, t);
    const [tx, ty] = bezTangent(curve, t);
    const w = (w0 + (w1 - w0) * Math.pow(t, 0.8)) / 2;
    const off = w * 0.42 * side;
    out.push({ x: x - ty * off, y: y + tx * off, r: Math.max(0.8, w * 0.28) });
  }
  return out;
}

/** Sample a polyline along a curve (for animating particles along it). */
export function sample(curve: Bezier, n = 24) {
  return Array.from({ length: n + 1 }, (_, i) => bez(curve, i / n));
}

/** The eight arms of the front-view octopus used across the octopus book (viewBox 600×600). */
export const ARMS: Bezier[] = [
  [[230, 292], [150, 296], [70, 250], [52, 170]],
  [[238, 318], [180, 380], [130, 420], [70, 520]],
  [[258, 336], [230, 420], [180, 500], [150, 575]],
  [[285, 344], [280, 440], [262, 510], [245, 585]],
  [[315, 344], [322, 440], [345, 505], [368, 585]],
  [[345, 338], [390, 430], [480, 470], [500, 560]],
  [[362, 318], [430, 370], [480, 400], [545, 470]],
  [[370, 292], [450, 290], [530, 240], [548, 165]],
];

// Pure SVG geometry of the runes circle, in canvas units (see `canvasFactor`).

import { Futhark } from "./model";

export type Point = [number, number];

/** Side of the square canvas in canvas units. */
export const canvasFactor = 250.0;
export const canvasCenter: Point = [0.5 * canvasFactor, 0.5 * canvasFactor];

function linearSpace(start: number, stop: number, n: number): number[] {
  return Array.from({ length: n }).map(
    (_, i) => start + (i * (stop - start)) / n
  );
}

function polarToRect(r: number, a: number, cx = 0, cy = 0): Point {
  return [r * Math.cos(a) + cx, r * Math.sin(a) + cy];
}

/** Build polygon with `n` vertices, `r` radius of described circle,
 *  center  at `cx, cy`, starting from `rot` angle. */
function polygonPoints(n: number, r: number, rot = 0, cx = 0, cy = 0): Point[] {
  return linearSpace(rot, rot + 2 * Math.PI, n).map((p) =>
    polarToRect(r, p, cx, cy)
  );
}

/** Returns coordinates of `k` vertex of polygon. */
export function polygonPoint(
  n: number,
  r: number,
  k: number,
  rot = 0,
  cx = 0,
  cy = 0
): Point {
  const a = rot + (2 * k * Math.PI) / n;
  return polarToRect(r, a, cx, cy);
}

/** Build star with given `n` vertices, `r1` inner and `r2` outer radii,
 *  center at `cx, cy`, starting from `rot` angle. */
function makeStarPoints(
  n: number,
  r1: number,
  r2: number,
  rot = 0,
  cx = 0,
  cy = 0
): Point[] {
  const p1 = polygonPoints(n, r1, rot, cx, cy);
  const p2 = polygonPoints(n, r2, rot + Math.PI / n, cx, cy);
  return p1.flatMap((x, i) => [x, p2[i]]);
}

/** Returns `[coords number]` for nearest polygon vertex for given `x, y` point.
  Polygon is described by `n, r, rot, cx, cy` */
function nearestPolygonPoint(
  n: number,
  r: number,
  [x, y]: Point,
  rot = 0,
  cx = 0,
  cy = 0
): [Point, number] {
  const phi = Math.atan2(y - cy, x - cx);
  const m1 = Math.round((phi * n) / (2 * Math.PI));
  const m2 = Math.round(((phi + rot) * n) / (2 * Math.PI));
  const a = (m1 * 2 * Math.PI) / n;
  return [polarToRect(r, a, cx, cy), (m2 < 0 ? m2 + n : m2) % n];
}

export function pointsToStr(points: Point[]): string {
  return points.map((coords) => coords.join(",")).join(" ");
}

const starOuterRadius = 100;
const starInnerRadius = 95;
const positionRuneRadius = 90;
const meaningRuneOuterRadius = 110;
const meaningRuneInnerRadius = 70;
export const meaningRuneSize = 16;
export const middleCircleRadius = 80;
export const innerCircleRadius = 60;
export const north = -0.5 * Math.PI;

export const starPoints = pointsToStr(
  makeStarPoints(Futhark.length, starOuterRadius, starInnerRadius)
);

export const positionsStar = polygonPoints(
  Futhark.length,
  positionRuneRadius,
  north
);

export const meaningsOuterStar = polygonPoints(
  Futhark.length,
  meaningRuneOuterRadius,
  north
);

export const meaningsInnerStar = polygonPoints(
  Futhark.length,
  meaningRuneInnerRadius,
  north
);

/** Nearest meaning slot to `p`: its coordinates and Futhark index. */
export function nearestPoint(p: Point): [Point, number] {
  return nearestPolygonPoint(Futhark.length, meaningRuneInnerRadius, p, -north);
}

export function distance(p1: Point, p2: Point): number {
  const a = p1[0] - p2[0];
  const b = p1[1] - p2[1];
  return Math.sqrt(a * a + b * b);
}

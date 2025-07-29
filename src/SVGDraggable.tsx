import { useCallback, useRef } from "react";
import { Point } from "./state";

const _SVGElement = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "svg"
);
const SVGPoint = _SVGElement.createSVGPoint();

function getScreenPoint(node: SVGGraphicsElement): DOMPoint {
  return SVGPoint.matrixTransform(node.getScreenCTM().inverse());
}

function isLeftButton(e: MouseEvent): boolean {
  return e.button === 0;
}

/** Project client{X,Y} to SVG node {x,y}. */
function svgLocation(node: SVGGraphicsElement, [x, y]: Point): Point {
  SVGPoint.x = x;
  SVGPoint.y = y;
  const p = getScreenPoint(node);
  return [p.x, p.y];
}

function location(e: MouseEvent | TouchEvent): Point {
  if ("touches" in e) {
    return [e.touches[0].clientX, e.touches[0].clientY];
  }
  return [e.clientX, e.clientY];
}

export function useSVGDraggable(
  {
    start,
    stop,
    setXY,
  }: { start: () => void; stop: () => void; setXY: (p: Point) => void },
  deps
): (newNode: any) => void {
  const node = useRef(null);
  const drag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (e.target) {
        setXY(svgLocation(e.target as SVGGraphicsElement, location(e)));
      }
    },
    [setXY]
  );
  const handleUp = useCallback((e: MouseEvent | TouchEvent) => {
    if ("touches" in e || isLeftButton(e as MouseEvent)) {
      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", drag);
      window.removeEventListener("touchend", handleUp);
      stop();
    }
  }, deps);
  const handleDown = useCallback((e: MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      e.preventDefault(); // Prevent scrolling on touch devices
      start();
      drag(e);
      window.addEventListener("touchmove", drag, { passive: false });
      window.addEventListener("touchend", handleUp);
    } else if (isLeftButton(e as MouseEvent)) {
      start();
      drag(e);
      window.addEventListener("mousemove", drag);
      window.addEventListener("mouseup", handleUp);
    }
  }, deps);
  const ref = useCallback((newNode) => {
    if (newNode === node.current) return;
    if (node.current) {
      node.current.removeEventListener("mousedown", handleDown);
      node.current.removeEventListener("touchstart", handleDown);
    }
    node.current = newNode;
    if (node.current) {
      node.current.addEventListener("mousedown", handleDown);
      node.current.addEventListener("touchstart", handleDown, {
        passive: false,
      });
    }
  }, deps);
  return ref;
}

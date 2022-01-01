import { useCallback, useRef } from "react";
import { useUpdateAtom } from "jotai/utils";
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
function svgLocation(node: SVGGraphicsElement, [x, y]): Point {
  SVGPoint.x = x;
  SVGPoint.y = y;
  const p = getScreenPoint(node);
  return [p.x, p.y];
}

function location(e: MouseEvent): Point {
  return [e.clientX, e.clientY];
}

export function useSVGDraggable({ start, stop, xy }, deps) {
  const setXY = useUpdateAtom(xy);
  const node = useRef(null);
  const drag = useCallback(
    (e: MouseEvent) => {
      if (e.target) {
        setXY(svgLocation(e.target as SVGGraphicsElement, location(e)));
      }
    },
    [setXY]
  );
  const mouseUp = useCallback((e: MouseEvent) => {
    if (isLeftButton(e)) {
      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", mouseUp);
      stop();
    }
  }, deps);
  const mouseDown = useCallback((e: MouseEvent) => {
    if (!isLeftButton(e)) return;
    start();
    drag(e);
    window.addEventListener("mousemove", drag);
    window.addEventListener("mouseup", mouseUp);
  }, deps);
  const ref = useCallback((newNode) => {
    if (newNode === node.current) return;
    if (node.current) {
      node.current.removeEventListener("mousedown", mouseDown);
    }
    node.current = newNode;
    if (node.current) {
      node.current.addEventListener("mousedown", mouseDown);
    }
  }, deps);
  return ref;
}

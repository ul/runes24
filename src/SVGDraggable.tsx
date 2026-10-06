import { useCallback, useRef } from "react";
import { Point } from "./geometry";

export interface DragHandlers {
  /** Return false to refuse the drag. */
  start: () => boolean;
  stop: () => void;
  /** Pointer position in the coordinate system of the dragged node's parent. */
  setXY: (p: Point) => void;
}

function isLeftButton(e: MouseEvent): boolean {
  return e.button === 0;
}

/** Project client{X,Y} to the user space of `frame`. */
function svgLocation(frame: SVGGraphicsElement, e: MouseEvent): Point | null {
  const ctm = frame.getScreenCTM();
  if (!ctm) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  return [p.x, p.y];
}

/** Make an SVG element draggable. Returns a callback ref for the element.
 *  Coordinates are taken relative to the element's parent, so transforms on
 *  the element itself (e.g. rotation of reversed runes) and whatever is under
 *  the pointer during the drag don't matter. */
export function useSVGDraggable(
  handlers: DragHandlers
): (node: SVGGraphicsElement | null) => void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const cleanup = useRef<() => void>();

  return useCallback((node: SVGGraphicsElement | null) => {
    cleanup.current?.();
    cleanup.current = undefined;
    const frame = node?.parentNode;
    if (!node || !(frame instanceof SVGGraphicsElement)) return;

    let dragging = false;
    const move = (e: MouseEvent) => {
      const p = svgLocation(frame, e);
      if (p) handlersRef.current.setXY(p);
    };
    const end = () => {
      if (!dragging) return;
      dragging = false;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      handlersRef.current.stop();
    };
    const up = (e: MouseEvent) => {
      if (isLeftButton(e)) end();
    };
    const down = (e: MouseEvent) => {
      if (!isLeftButton(e) || !handlersRef.current.start()) return;
      dragging = true;
      move(e);
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    };

    node.addEventListener("mousedown", down);
    cleanup.current = () => {
      node.removeEventListener("mousedown", down);
      end();
    };
  }, []);
}

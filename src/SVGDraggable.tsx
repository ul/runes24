import { useCallback, useRef } from "react";
import { Point } from "./geometry";

export interface DragHandlers {
  /** Return false to refuse the drag. */
  start: () => boolean;
  stop: () => void;
  /** Pointer position in the coordinate system of the dragged node's parent. */
  setXY: (p: Point) => void;
}

/** Project client{X,Y} to the user space of `frame`. */
function svgLocation(frame: SVGGraphicsElement, e: PointerEvent): Point | null {
  const ctm = frame.getScreenCTM();
  if (!ctm) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  return [p.x, p.y];
}

/** Make an SVG element draggable with mouse, touch or pen. Returns a
 *  callback ref for the element. Coordinates are taken relative to the
 *  element's parent, so transforms on the element itself (e.g. rotation of
 *  reversed runes) and whatever is under the pointer during the drag don't
 *  matter. Give the element `touch-action: none` so touch drags don't
 *  scroll the page. */
export function useSVGDraggable(
  handlers: DragHandlers,
): (node: SVGGraphicsElement | null) => void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const cleanup = useRef<(() => void) | undefined>(undefined);

  return useCallback((node: SVGGraphicsElement | null) => {
    cleanup.current?.();
    cleanup.current = undefined;
    const frame = node?.parentNode;
    if (!node || !(frame instanceof SVGGraphicsElement)) return;

    /** The pointer doing the drag; others (a second finger) are ignored. */
    let pointerId: number | null = null;
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      // Releasing the left button while another is held gives no pointerup.
      if (e.pointerType === "mouse" && !(e.buttons & 1)) return end(e);
      const p = svgLocation(frame, e);
      if (p) handlersRef.current.setXY(p);
    };
    const end = (e?: PointerEvent) => {
      if (pointerId === null || (e && e.pointerId !== pointerId)) return;
      pointerId = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      handlersRef.current.stop();
    };
    const down = (e: PointerEvent) => {
      // Primary button for mice; any primary touch or pen contact.
      if (pointerId !== null || !e.isPrimary || e.button !== 0) return;
      if (!handlersRef.current.start()) return;
      pointerId = e.pointerId;
      move(e);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
    };

    node.addEventListener("pointerdown", down);
    cleanup.current = () => {
      node.removeEventListener("pointerdown", down);
      end();
    };
  }, []);
}

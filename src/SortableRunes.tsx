import React, { CSSProperties, HTMLAttributes, ReactNode } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Rune } from "./model";

/** Props to spread onto the element the user grabs to drag an item. */
export type DragHandleProps = HTMLAttributes<HTMLElement> & {
  ref: (element: HTMLElement | null) => void;
};

function SortableItem({
  id,
  disabled,
  children,
}: {
  id: Rune;
  disabled: boolean;
  children: (handle: DragHandleProps) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });
  const style: CSSProperties = {
    // Translate only: scaling would distort cards of different heights.
    transform: CSS.Translate.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 1 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({
        ref: setActivatorNodeRef,
        ...attributes,
        ...listeners,
        // Otherwise touchscreens scroll the page instead of dragging.
        style: disabled ? undefined : { touchAction: "none" },
      })}
    </div>
  );
}

/** A list of runes the user can reorder by dragging, as a wrapping grid or
 *  a vertical list. */
export function SortableRunes({
  runes,
  layout,
  disabled = false,
  onReorder,
  className,
  style,
  children,
}: {
  runes: Rune[];
  layout: "grid" | "vertical";
  disabled?: boolean;
  onReorder: (runes: Rune[]) => void;
  className?: string;
  style?: CSSProperties;
  children: (rune: Rune, handle: DragHandleProps) => ReactNode;
}) {
  const sensors = useSensors(
    // A few pixels of movement before dragging, so clicks still work.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = runes.indexOf(active.id as Rune);
    const to = runes.indexOf(over.id as Rune);
    if (from >= 0 && to >= 0) onReorder(arrayMove(runes, from, to));
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={runes}
        strategy={
          layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy
        }
        disabled={disabled}
      >
        <div className={className} style={style}>
          {runes.map((rune) => (
            <SortableItem key={rune} id={rune} disabled={disabled}>
              {(handle) => children(rune, handle)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

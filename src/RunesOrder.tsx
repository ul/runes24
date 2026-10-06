import React, { useCallback } from "react";
import { useAtom } from "./atom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import Stack from "@mui/material/Stack";
import { Token } from "./Token";
import { reorder } from "./reorder";
import { AllRunes, Rune } from "./model";
import { setThemeOrder, themeOrder } from "./state";

// aligned-rbd supports "grid"; @types/react-beautiful-dnd doesn't know it.
const gridDirection = "grid" as "horizontal";

export function RunesOrder({
  theme = AllRunes,
  runes,
  onClick,
}: {
  theme?: string;
  runes?: Rune[];
  onClick?: (rune: Rune) => void;
}) {
  const order = useAtom(themeOrder(theme));
  const orderedRunes = runes || order;
  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      setThemeOrder(
        theme,
        reorder(orderedRunes, result.source.index, result.destination.index)
      );
    },
    [orderedRunes, theme]
  );
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="RuneOrder" direction={gridDirection}>
        {(provided) => (
          <Stack
            {...provided.droppableProps}
            ref={provided.innerRef}
            direction="row"
            sx={{ flexWrap: "wrap" }}
          >
            {orderedRunes.map((rune: Rune, index) => (
              <Draggable
                key={rune}
                draggableId={rune}
                index={index}
                isDragDisabled={!!runes}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                  >
                    <Token
                      key={rune}
                      onClick={onClick && (() => onClick(rune))}
                      position={rune}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
}

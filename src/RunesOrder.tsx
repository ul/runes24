import Stack from "@mui/material/Stack";
import { useAtom } from "jotai";
import React, { useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { currentSpread, Rune, themes } from "./state";
import { Token } from "./Token";

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function RunesOrder({
  theme = "AllRunes",
  runes,
  onClick,
}: {
  theme?: string;
  runes?: Rune[];
  onClick?: (rune: Rune) => void;
}) {
  const [spread, setSpread] = useAtom(currentSpread);
  const [themeSpecs] = useAtom(themes);
  const orderedRunes =
    runes ||
    spread?.order[theme] ||
    themeSpecs.find((t) => t.name === theme)?.runes ||
    [];
  const onDragEnd = useCallback(
    (result) => {
      if (!spread || !result.destination) return;
      setSpread({
        ...spread,
        order: {
          ...spread.order,
          [theme]: reorder(
            orderedRunes,
            result.source.index,
            result.destination.index
          ),
        },
      });
    },
    [spread, setSpread, orderedRunes]
  );
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="RuneOrder" direction="grid">
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

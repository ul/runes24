import React, { Fragment, useCallback } from "react";
import { useAtom } from "jotai";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Stack from "@mui/material/Stack";
import { Token } from "./Token";
import { PositionCard } from "./PositionCard";
import { Rune, themeOrder } from "./state";

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function DraggablePositionCards({
  theme,
  runes,
}: {
  theme: string;
  runes?: Rune[];
}) {
  const [order, setOrder] = useAtom(themeOrder(theme));
  const orderedRunes = runes || order;
  const onDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      setOrder(
        reorder(orderedRunes, result.source.index, result.destination.index)
      );
    },
    [orderedRunes, setOrder]
  );
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="PositionCards">
        {(provided) => (
          <Stack
            {...provided.droppableProps}
            ref={provided.innerRef}
            spacing={2}
          >
            {orderedRunes.map((rune, index) => (
              <Fragment key={rune}>
                <Draggable
                  draggableId={rune}
                  index={index}
                  isDragDisabled={!!runes}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={provided.draggableProps.style}
                    >
                      <Stack direction="row" spacing={1}>
                        <div {...provided.dragHandleProps}>
                          <Token position={rune} noColor />
                        </div>
                        <PositionCard position={rune} theme={theme} />
                      </Stack>
                    </div>
                  )}
                </Draggable>
              </Fragment>
            ))}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
}

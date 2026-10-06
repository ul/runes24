import React, { Fragment, useCallback } from "react";
import { useAtom } from "./atom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import Stack from "@mui/material/Stack";
import { Token } from "./Token";
import { PositionCard } from "./PositionCard";
import { reorder } from "./reorder";
import { AllRunes, Rune, Sum } from "./model";
import { themeOrder, setThemeOrder } from "./state";

export function DraggablePositionCards({
  theme,
  runes,
  noSum,
}: {
  theme: string;
  runes?: Rune[];
  noSum?: boolean;
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
    <Stack>
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
      {noSum ? null : (
        <Stack direction="row" spacing={1}>
          <Token position={Sum} noColor />
          <PositionCard position={Sum} theme={theme} />
        </Stack>
      )}
    </Stack>
  );
}

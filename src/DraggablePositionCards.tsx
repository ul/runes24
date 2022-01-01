import React, { Fragment, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { currentSpread, themes } from "./state";
import { useAtom } from "jotai";
import Stack from "@mui/material/Stack";
import { Token } from "./Token";
import { PositionCard } from "./PositionCard";

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function DraggablePositionCards({ theme }: { theme: string }) {
  const [spread, setSpread] = useAtom(currentSpread);
  const [themeSpecs] = useAtom(themes);
  const runes =
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
            runes,
            result.source.index,
            result.destination.index
          ),
        },
      });
    },
    [spread, setSpread, runes]
  );
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <Stack
            {...provided.droppableProps}
            ref={provided.innerRef}
            spacing={1}
          >
            {runes.map((rune, index) => (
              <Fragment key={rune}>
                <Draggable draggableId={rune} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={
                        provided.draggableProps.style /*getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )*/
                      }
                    >
                      <Stack direction="row" spacing={1}>
                        <div {...provided.dragHandleProps}>
                          <Token position={rune} />
                        </div>
                        <PositionCard position={rune} theme={theme} />
                      </Stack>
                    </div>
                  )}
                </Draggable>
                {/*<Divider orientation="horizontal" light />*/}
              </Fragment>
            ))}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
}

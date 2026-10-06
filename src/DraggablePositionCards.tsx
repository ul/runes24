import React from "react";
import { useAtom } from "./atom";
import Stack from "@mui/material/Stack";
import { Token } from "./Token";
import { PositionCard } from "./PositionCard";
import { SortableRunes } from "./SortableRunes";
import { Rune, Sum } from "./model";
import { themeOrder, setThemeOrder } from "./state";

/** Reading cards of a theme. Without `runes`, they follow the theme's order,
 *  which can be changed by dragging a card by its rune. */
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
  return (
    <Stack spacing={2}>
      <SortableRunes
        runes={runes || order}
        layout="vertical"
        disabled={!!runes}
        onReorder={(newOrder) => setThemeOrder(theme, newOrder)}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {(rune, handle) => (
          <Stack direction="row" spacing={1}>
            <div {...handle}>
              <Token position={rune} noColor />
            </div>
            <PositionCard position={rune} theme={theme} />
          </Stack>
        )}
      </SortableRunes>
      {noSum ? null : (
        <Stack direction="row" spacing={1}>
          <Token position={Sum} noColor />
          <PositionCard position={Sum} theme={theme} />
        </Stack>
      )}
    </Stack>
  );
}

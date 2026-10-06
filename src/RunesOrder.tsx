import React from "react";
import { useAtom } from "./atom";
import { Token } from "./Token";
import { SortableRunes } from "./SortableRunes";
import { AllRunes, Rune } from "./model";
import { setThemeOrder, themeOrder } from "./state";

/** Row of rune tokens. Without `runes`, shows the theme's order, which can
 *  be changed by dragging. */
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
  return (
    <SortableRunes
      runes={runes || order}
      layout="grid"
      disabled={!!runes}
      onReorder={(newOrder) => setThemeOrder(theme, newOrder)}
      style={{ display: "flex", flexWrap: "wrap" }}
    >
      {(rune, handle) => (
        <div {...handle}>
          <Token onClick={onClick && (() => onClick(rune))} position={rune} />
        </div>
      )}
    </SortableRunes>
  );
}

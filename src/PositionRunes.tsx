import React from "react";
import { Futhark, Rune } from "./model";
import { Point, positionsStar } from "./geometry";
import { selectChain, slotByPosition } from "./state";

function PositionRune({
  rune,
  position: [x, y],
}: {
  rune: Rune;
  position: Point;
}) {
  return (
    <text
      className="rune position-rune"
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      onClick={() => {
        if (slotByPosition(rune).value) selectChain(rune, rune);
      }}
    >
      {rune}
    </text>
  );
}

export function PositionRunes() {
  return (
    <g>
      {Futhark.map((rune, i) => (
        <PositionRune key={rune} rune={rune} position={positionsStar[i]} />
      ))}
    </g>
  );
}

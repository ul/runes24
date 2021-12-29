import React from "react";
import { Futhark, positionsStar, positionRuneSize } from "./state";

function PositionRune({ rune, position: [x, y] }) {
  return (
    <text
      className="rune position-rune"
      x={x}
      y={y + 0.5 * positionRuneSize}
      onClick={() => {
        console.log("reset current rune");
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

import React from "react";
import { useAtom } from "./atom";
import {
  currentChain,
  currentChains,
  Futhark,
  Point,
  positionsStar,
  Rune,
  temporaryPin,
} from "./state";

function PositionRune({
  rune,
  position: [x, y],
}: {
  rune: Rune;
  position: Point;
}) {
  const allChains = useAtom(currentChains);
  return (
    <text
      className="rune position-rune"
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      onClick={() => {
        let i = 0;
        for (const chain of allChains) {
          for (const slot of chain) {
            if (slot.position === rune) {
              temporaryPin.reset(rune);
              currentChain.reset(i);
              return;
            }
          }
          i++;
        }
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

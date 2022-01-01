import { useAtom } from "jotai";
import { useUpdateAtom } from "jotai/utils";
import React from "react";
import {
  currentSpread,
  Futhark,
  meaningsOuterStar,
  meaningsInnerStar,
  movingRune,
  movingRuneCoords,
  reverseRune,
  snapMovingRune,
  straightenFreeRunes,
} from "./state";
import { useSVGDraggable } from "./SVGDraggable";

function norm(x: number): number {
  return Math.round(1e4 * x) / 1e4;
}

function MeaningRune({ rune, index }) {
  const [spread] = useAtom(currentSpread);
  const [movingRuneValue, setMovingRune] = useAtom(movingRune);
  const [movingRuneXY] = useAtom(movingRuneCoords);
  const reverse = useUpdateAtom(reverseRune);
  const fixReverse = useUpdateAtom(straightenFreeRunes);
  const ref = useSVGDraggable(
    {
      start: () => {
        if (spread.locked) return;
        setMovingRune(rune);
      },
      stop: () => {
        if (spread.locked) return;
        setMovingRune("");
        fixReverse();
      },
      xy: snapMovingRune,
    },
    [spread.locked]
  );
  const slot = spread.circle.find(({ meaning }) => meaning === rune);
  const isMoving = movingRuneValue === rune;
  const [x, y] = slot
    ? meaningsInnerStar[Futhark.indexOf(slot.position)]
    : isMoving
    ? movingRuneXY
    : meaningsOuterStar[index];
  return (
    <text
      ref={ref}
      className="rune meaning-rune"
      x={norm(x)}
      y={norm(y)}
      textAnchor="middle"
      dominantBaseline="central"
      transform={
        !isMoving && spread.rx.includes(rune)
          ? `rotate(180,${norm(x)},${norm(y)})`
          : null
      }
      onDoubleClick={(e) => {
        e.preventDefault();
        if (spread.locked) return;
        reverse(rune);
      }}
    >
      {rune}
    </text>
  );
}

export function MeaningRunes() {
  return (
    <g>
      {Futhark.map((rune, index) => (
        <MeaningRune key={rune} rune={rune} index={index} />
      ))}
    </g>
  );
}

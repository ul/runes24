import React from "react";
import { useAtom } from "jotai";
import { useUpdateAtom } from "jotai/utils";
import { useSVGDraggable } from "./SVGDraggable";
import {
  Futhark,
  meaningsOuterStar,
  meaningsInnerStar,
  movingRune,
  movingRuneCoords,
  reverseRune,
  snapMovingRune,
  straightenFreeRunes,
  Rune,
  currentSpreadLocked,
  slotByMeaning,
  isReversedByMeaning,
} from "./state";

function norm(x: number): number {
  return Math.round(1e4 * x) / 1e4;
}

function MeaningRune({ rune, index }: { rune: Rune; index: number }) {
  const [isLocked] = useAtom(currentSpreadLocked);
  const [slotValue] = useAtom(slotByMeaning(rune));
  const [isRX] = useAtom(isReversedByMeaning(rune));
  const [movingRuneValue, setMovingRune] = useAtom(movingRune);
  const [movingRuneXY] = useAtom(movingRuneCoords);
  const reverse = useUpdateAtom(reverseRune);
  const fixReverse = useUpdateAtom(straightenFreeRunes);
  const ref = useSVGDraggable(
    {
      start: () => {
        if (isLocked) return;
        setMovingRune(rune);
      },
      stop: () => {
        if (isLocked) return;
        setMovingRune(undefined);
        fixReverse(null);
      },
      xy: snapMovingRune,
    },
    [isLocked]
  );
  const isMoving = movingRuneValue === rune;
  const [x, y] = slotValue
    ? meaningsInnerStar[Futhark.indexOf(slotValue.position)]
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
        !isMoving && isRX ? `rotate(180,${norm(x)},${norm(y)})` : undefined
      }
      onDoubleClick={(e) => {
        e.preventDefault();
        if (isLocked || !slotValue) return;
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

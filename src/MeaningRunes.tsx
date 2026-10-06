import React from "react";
import { useAtom } from "./atom";
import { useSVGDraggable } from "./SVGDraggable";
import { Futhark, Rune } from "./model";
import { meaningsOuterStar, meaningsInnerStar } from "./geometry";
import {
  movingRune,
  movingRuneCoords,
  reverseRune,
  snapMovingRune,
  straightenFreeRunes,
  currentSpreadLocked,
  slotByMeaning,
  isReversedByMeaning,
} from "./state";

function norm(x: number): number {
  return Math.round(1e4 * x) / 1e4;
}

function MeaningRune({ rune, index }: { rune: Rune; index: number }) {
  const slotValue = useAtom(slotByMeaning(rune));
  const isRX = useAtom(isReversedByMeaning(rune));
  const movingRuneValue = useAtom(movingRune);
  const movingRuneXY = useAtom(movingRuneCoords);
  const ref = useSVGDraggable({
    start: () => {
      if (currentSpreadLocked.value) return false;
      movingRune.reset(rune);
      return true;
    },
    stop: () => {
      movingRune.reset(undefined);
      straightenFreeRunes();
    },
    setXY: snapMovingRune,
  });
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
        if (!slotValue) return;
        reverseRune(rune);
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

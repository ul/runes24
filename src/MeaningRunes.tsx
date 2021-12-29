import { useAtom } from "jotai";
import { useUpdateAtom } from "jotai/utils";
import React from "react";
import {
  currentSpread,
  Futhark,
  meaningsOuterStar,
  meaningsInnerStar,
  meaningRuneSize,
  movingRune,
  movingRuneCoords,
  reverseRune,
  snapMovingRune,
} from "./state";
import { useSVGDraggable } from "./SVGDraggable";

function MeaningRune({ rune, index }) {
  const [movingRuneValue, setMovingRune] = useAtom(movingRune);
  const [movingRuneXY] = useAtom(movingRuneCoords);
  const reverse = useUpdateAtom(reverseRune);
  const ref = useSVGDraggable({
    start: () => {
      setMovingRune(rune);
    },
    stop: () => {
      setMovingRune("");
    },
    xy: snapMovingRune,
  });
  const [spread] = useAtom(currentSpread);
  const slot = spread.circle.find(({ meaning }) => meaning === rune);
  const [x, y] =
    movingRuneValue === rune
      ? movingRuneXY
      : slot
      ? meaningsInnerStar[Futhark.indexOf(slot.position)]
      : meaningsOuterStar[index];
  return (
    <text
      ref={ref}
      className="rune meaning-rune"
      x={x}
      y={y + 0.5 * meaningRuneSize}
      transform={spread.rx.includes(rune) ? `rotate(180,${x},${y})` : null}
      onDoubleClick={(e) => {
        e.preventDefault();
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

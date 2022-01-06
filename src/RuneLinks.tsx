import React, { memo } from "react";
import { useAtom } from "./atom";
import {
  currentCircle,
  Futhark,
  innerCircleRadius,
  north,
  pointsToStr,
  polygonPoint,
  Rune,
} from "./state";

const pp = (k: number, rot: number) =>
  polygonPoint(Futhark.length, innerCircleRadius, k, rot);

const RuneLink = memo(function RuneLink({
  meaning,
  position,
}: {
  meaning: Rune;
  position: Rune;
}) {
  const isShort = meaning === position;
  const [cx, cy] = pp(Futhark.indexOf(position), north);
  return (
    <g>
      {isShort ? (
        <circle className="rune-link" r={2.5} cx={cx} cy={cy} />
      ) : (
        <polygon
          className="rune-link"
          points={pointsToStr([
            pp(Futhark.indexOf(position), north - 0.05),
            pp(Futhark.indexOf(position), north + 0.05),
            pp(Futhark.indexOf(meaning), north),
          ])}
        />
      )}
    </g>
  );
});

export function RuneLinks() {
  const circle = useAtom(currentCircle);
  return (
    <g>
      {circle?.map(({ position, meaning }) => (
        <RuneLink
          key={`${position}${meaning}`}
          meaning={meaning}
          position={position}
        />
      ))}
    </g>
  );
}

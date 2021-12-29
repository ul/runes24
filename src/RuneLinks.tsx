import { useAtom } from "jotai";
import React from "react";
import {
  currentSpread,
  Futhark,
  innerCircleRadius,
  north,
  pointsToStr,
  polygonPoint,
} from "./state";

const pp = (k, rot) => polygonPoint(Futhark.length, innerCircleRadius, k, rot);

function RuneLink({ meaning, position }) {
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
}

export function RuneLinks() {
  const [{ circle }] = useAtom(currentSpread);
  return (
    <g>
      {circle.map(({ position, meaning }) => (
        <RuneLink
          key={`${position}${meaning}`}
          meaning={meaning}
          position={position}
        />
      ))}
    </g>
  );
}

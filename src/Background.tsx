import React from "react";
import { starPoints, middleCircleRadius, innerCircleRadius } from "./state";

export function Background() {
  return (
    <g>
      <polygon className="star" points={starPoints} />
      <circle className="middle-circle" r={middleCircleRadius} />
      <circle className="inner-circle" r={innerCircleRadius} />
    </g>
  );
}

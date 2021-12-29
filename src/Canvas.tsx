import { useAtom } from "jotai";
import React from "react";
import { canvasSize, cx, cy, scale } from "./state";
import { Background } from "./Background";
import { PositionRunes } from "./PositionRunes";
import { RuneLinks } from "./RuneLinks";
import { MeaningRunes } from "./MeaningRunes";
import Stack from "@mui/material/Stack";

export function Canvas() {
  const [size] = useAtom(canvasSize);
  const [cxValue] = useAtom(cx);
  const [cyValue] = useAtom(cy);
  const [scaleValue] = useAtom(scale);
  return (
    <Stack alignItems="center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size, height: size }}
      >
        <g transform={`scale(${scaleValue}),translate(${cxValue},${cyValue})`}>
          <Background />
          <PositionRunes />
          <RuneLinks />
          <MeaningRunes />
        </g>
      </svg>
    </Stack>
  );
}

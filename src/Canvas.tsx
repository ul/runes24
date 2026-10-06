import React from "react";
import { useAtom } from "./atom";
import Stack from "@mui/material/Stack";
import { Background } from "./Background";
import { PositionRunes } from "./PositionRunes";
import { RuneLinks } from "./RuneLinks";
import { MeaningRunes } from "./MeaningRunes";
import { canvasCenter, canvasFactor } from "./geometry";
import { canvasSize } from "./state";

export function Canvas() {
  const size = useAtom(canvasSize);
  const scale = size / canvasFactor;
  const [cx, cy] = canvasCenter;
  return (
    <Stack sx={{ alignItems: "center" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size, height: size }}
      >
        <g transform={`scale(${scale}),translate(${cx},${cy})`}>
          <Background />
          <PositionRunes />
          <RuneLinks />
          <MeaningRunes />
        </g>
      </svg>
    </Stack>
  );
}

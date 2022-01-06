import React from "react";
import { useAtom } from "./atom";
import Slider from "@mui/material/Slider";
import { canvasSize } from "./state";

export function CanvasSize() {
  const size = useAtom(canvasSize);
  return (
    <Slider
      value={size}
      min={200}
      max={1600}
      step={10}
      onChange={(_, value) =>
        canvasSize.reset(Array.isArray(value) ? value[0] : value)
      }
    />
  );
}

import React from "react";
import Slider from "@mui/material/Slider";
import { useAtom } from "jotai";
import { canvasSize } from "./state";

export function CanvasSize() {
  const [canvasSizeValue, setCanvasSize] = useAtom(canvasSize);
  return (
    <Slider
      value={canvasSizeValue}
      min={200}
      max={1600}
      step={10}
      onChange={(_, value) =>
        setCanvasSize(Array.isArray(value) ? value[0] : value)
      }
    />
  );
}

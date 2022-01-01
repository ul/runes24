import React from "react";
import Stack from "@mui/material/Stack";
import { Canvas } from "./Canvas";
import { Reading } from "./Reading";
import { SpreadMeta } from "./SpreadMeta";
import { DeleteSpread } from "./DeleteSpread";
import { CanvasSize } from "./CanvasSize";

export function EditSpread() {
  return (
    <Stack spacing={1} p={2}>
      <SpreadMeta />
      <CanvasSize />
      <Canvas />
      <Reading />
      <DeleteSpread />
    </Stack>
  );
}

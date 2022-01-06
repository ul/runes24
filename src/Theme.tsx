import React from "react";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { DraggablePositionCards } from "./DraggablePositionCards";
import { RunesOrder } from "./RunesOrder";

export function Theme({ theme }: { theme: string }) {
  return (
    <Stack>
      <RunesOrder theme={theme} />
      <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 2 }} />
      <DraggablePositionCards theme={theme} />
    </Stack>
  );
}

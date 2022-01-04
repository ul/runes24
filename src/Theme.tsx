import React from "react";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { DraggablePositionCards } from "./DraggablePositionCards";
import { RunesOrder } from "./RunesOrder";
import { ThemeScheme } from "./state";

export function Theme({ theme }: { theme: ThemeScheme }) {
  return (
    <Stack>
      <RunesOrder theme={theme.name} />
      <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 2 }} />
      <DraggablePositionCards theme={theme.name} />
    </Stack>
  );
}

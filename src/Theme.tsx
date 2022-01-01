import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { useAtom } from "jotai";
import React from "react";
import { DraggablePositionCards } from "./DraggablePositionCards";
import { RunesOrder } from "./RunesOrder";
import { currentSpread, Rune } from "./state";

export function Theme({ theme }: { theme: { name: string; runes: Rune[] } }) {
  const [spread] = useAtom(currentSpread);
  const runes = spread?.order[theme.name] || theme.runes || [];

  return (
    <Stack>
      <RunesOrder runes={runes} onClick={() => {}} />
      <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 2 }} />
      <DraggablePositionCards theme={theme.name} />
    </Stack>
  );
}

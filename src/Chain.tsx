import React from "react";
import { useAtom } from "./atom";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { RunesOrder } from "./RunesOrder";
import { DraggablePositionCards } from "./DraggablePositionCards";
import {
  currentChain,
  pinCurrentChain,
  pinnedChains,
  temporaryPin,
} from "./state";

export function Chain({ chain }: { chain: number }) {
  const allChains = useAtom(pinnedChains);
  const runes = allChains[chain].map((s) => s.position);
  return (
    <Stack>
      <Stack
        direction="row"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem />}
        mb={1}
      >
        <Button
          onClick={() => {
            currentChain.reset(undefined);
            temporaryPin.reset(undefined);
          }}
        >
          ← All
        </Button>
        <Button onClick={() => pinCurrentChain(runes[0])}>Pin</Button>
      </Stack>
      <RunesOrder runes={runes} onClick={(rune) => temporaryPin.reset(rune)} />
      <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 1 }} />
      <DraggablePositionCards theme="AllRunes" runes={runes} noSum />
    </Stack>
  );
}

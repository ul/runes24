import React from "react";
import { useAtom } from "jotai";
import { useUpdateAtom } from "jotai/utils";
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
  const [allChains] = useAtom(pinnedChains);
  const setChain = useUpdateAtom(currentChain);
  const setTempPin = useUpdateAtom(temporaryPin);
  const setPin = useUpdateAtom(pinCurrentChain);
  const slots = allChains[chain];
  const runes = slots.map((s) => s.position);
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
            setChain(undefined);
            setTempPin(undefined);
          }}
        >
          ← All
        </Button>
        <Button onClick={() => setPin(runes[0])}>Pin</Button>
      </Stack>
      <RunesOrder runes={runes} onClick={(rune) => setTempPin(rune)} />
      <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 1 }} />
      <DraggablePositionCards theme="AllRunes" runes={runes} noSum />
    </Stack>
  );
}

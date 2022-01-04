import React from "react";
import { useAtom } from "jotai";
import { useUpdateAtom } from "jotai/utils";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { RunesOrder } from "./RunesOrder";
import { DraggablePositionCards } from "./DraggablePositionCards";
import { ChainsSwitch } from "./ChainsSwitch";
import { currentChain, resetOrder, Rune, runeChains } from "./state";

export function FutharkOrder() {
  const [runeToChain] = useAtom(runeChains);
  const setCurrentChain = useUpdateAtom(currentChain);
  const doResetOrder = useUpdateAtom(resetOrder);
  return (
    <Stack>
      <Stack
        direction="row"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem />}
        mb={1}
      >
        <ChainsSwitch />
        <Button onClick={() => doResetOrder(null)}>Reset</Button>
      </Stack>
      <RunesOrder
        theme="AllRunes"
        onClick={(rune: Rune) => {
          setCurrentChain(runeToChain[rune]);
        }}
      />
      <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 1 }} />
      <DraggablePositionCards theme="AllRunes" />
    </Stack>
  );
}

import React from "react";
import { useAtom } from "./atom";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { RunesOrder } from "./RunesOrder";
import { DraggablePositionCards } from "./DraggablePositionCards";
import { ChainsSwitch } from "./ChainsSwitch";
import { currentChain, resetOrder, Rune, runeChains } from "./state";

export function FutharkOrder() {
  const runeToChain = useAtom(runeChains);
  return (
    <Stack>
      <Stack
        direction="row"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem />}
        mb={1}
      >
        <ChainsSwitch />
        <Button onClick={() => resetOrder()}>Reset</Button>
      </Stack>
      <RunesOrder
        theme="AllRunes"
        onClick={(rune: Rune) => {
          currentChain.reset(runeToChain[rune]);
        }}
      />
      <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 1 }} />
      <DraggablePositionCards theme="AllRunes" />
    </Stack>
  );
}

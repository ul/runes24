import React from "react";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { RunesOrder } from "./RunesOrder";
import { DraggablePositionCards } from "./DraggablePositionCards";
import { ChainsSwitch } from "./ChainsSwitch";
import { AllRunes, Rune } from "./model";
import { resetOrder, selectChain, slotByPosition } from "./state";

export function FutharkOrder() {
  return (
    <Stack>
      <Stack
        sx={{ mb: 1 }}
        direction="row"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem />}
      >
        <ChainsSwitch />
        <Button onClick={() => resetOrder()}>Reset</Button>
      </Stack>
      <RunesOrder
        theme={AllRunes}
        onClick={(rune: Rune) => {
          // Every placed position belongs to a chain.
          if (slotByPosition(rune).value) selectChain(rune);
        }}
      />
      <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 1 }} />
      <DraggablePositionCards theme={AllRunes} />
    </Stack>
  );
}

import React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { RunesOrder } from "./RunesOrder";
import { DraggablePositionCards } from "./DraggablePositionCards";
import { AllRunes, Chain as ChainT } from "./model";
import { pinSelectedChain, selectChain, setTemporaryPin } from "./state";

export function Chain({ chain }: { chain: ChainT }) {
  const runes = chain.map((s) => s.position);
  return (
    <Stack>
      <Stack
        sx={{ mb: 1 }}
        direction="row"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem />}
      >
        <Button onClick={() => selectChain(undefined)}>← All</Button>
        <Button onClick={() => pinSelectedChain(runes[0])}>Pin</Button>
      </Stack>
      <RunesOrder runes={runes} onClick={setTemporaryPin} />
      <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 1 }} />
      <DraggablePositionCards theme={AllRunes} runes={runes} noSum />
    </Stack>
  );
}

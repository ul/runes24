import React from "react";
import { useAtom } from "jotai";
import { useUpdateAtom } from "jotai/utils";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { RunesOrder } from "./RunesOrder";
import { DraggablePositionCards } from "./DraggablePositionCards";
import { ChainsSwitch } from "./ChainsSwitch";
import { currentChain, pinnedChains } from "./state";

export function Chains() {
  const [allChains] = useAtom(pinnedChains);
  const setCurrentChain = useUpdateAtom(currentChain);
  const runeGroups = allChains.map((chain) => chain.map((s) => s.position));
  return (
    <Stack>
      <Stack
        direction="row"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem />}
        mb={1}
      >
        <ChainsSwitch />
      </Stack>
      {runeGroups.map((runes, i) => (
        <RunesOrder key={i} runes={runes} onClick={() => setCurrentChain(i)} />
      ))}
      <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 1 }} />
      <DraggablePositionCards
        theme="AllRunes"
        runes={runeGroups.flatMap((x) => x)}
      />
    </Stack>
  );
}

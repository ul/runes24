import React, { Fragment } from "react";
import { useAtom } from "./atom";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { RunesOrder } from "./RunesOrder";
import { DraggablePositionCards } from "./DraggablePositionCards";
import { ChainsSwitch } from "./ChainsSwitch";
import { AllRunes } from "./model";
import { pinnedChains, selectChain } from "./state";

export function Chains() {
  const allChains = useAtom(pinnedChains);
  const runeGroups = allChains.map((chain) => chain.map((s) => s.position));
  return (
    <Stack>
      <Stack
        sx={{ mb: 1 }}
        direction="row"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem />}
      >
        <ChainsSwitch />
      </Stack>
      {runeGroups.map((runes) => (
        <RunesOrder
          key={runes[0]}
          runes={runes}
          onClick={() => selectChain(runes[0])}
        />
      ))}
      {runeGroups.map((runes) => (
        <Fragment key={runes[0]}>
          <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 1 }} />
          <DraggablePositionCards theme={AllRunes} runes={runes} noSum />
        </Fragment>
      ))}
    </Stack>
  );
}

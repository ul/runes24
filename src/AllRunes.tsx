import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import { useAtom } from "jotai";
import { useUpdateAtom } from "jotai/utils";
import React, { useState } from "react";
import {
  currentChain,
  currentSpread,
  pinCurrentChain,
  pinnedChains,
  Rune,
  runeChains,
  temporaryPin,
} from "./state";
import Divider from "@mui/material/Divider";
import { RunesOrder } from "./RunesOrder";
import { PositionCard } from "./PositionCard";
import { Token } from "./Token";
import { DraggablePositionCards } from "./DraggablePositionCards";

function FutharkOrder() {
  const [spread] = useAtom(currentSpread);
  const [runeToChain] = useAtom(runeChains);
  const setCurrentChain = useUpdateAtom(currentChain);
  const runes = spread?.order.AllRunes || [];
  return (
    <Stack>
      <RunesOrder
        runes={runes}
        onClick={(rune: Rune) => {
          setCurrentChain(runeToChain[rune] ?? -1);
        }}
      />
    </Stack>
  );
}

function Chains() {
  const [allChains] = useAtom(pinnedChains);
  const setCurrentChain = useUpdateAtom(currentChain);
  return (
    <Stack>
      {allChains.map((chain, i) => (
        <RunesOrder
          key={i}
          runes={chain.map((s) => s.position)}
          onClick={() => {
            setCurrentChain(i);
          }}
        />
      ))}
    </Stack>
  );
}

function Chain() {
  const [allChains] = useAtom(pinnedChains);
  const [chain, setChain] = useAtom(currentChain);
  const setTempPin = useUpdateAtom(temporaryPin);
  const setPin = useUpdateAtom(pinCurrentChain);
  const slots = allChains[chain];
  const runes = slots.map((s) => s.position);
  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem />}
        mb={1}
      >
        <Button
          onClick={() => {
            setChain(-1);
            setTempPin(null);
          }}
        >
          ← All
        </Button>
        <Button onClick={() => setPin(runes[0])}>Pin</Button>
      </Stack>
      <RunesOrder
        runes={runes}
        onClick={(rune) => {
          setTempPin(rune);
        }}
      />
      <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 2 }} />
      {runes.map((rune) => (
        <Stack direction="row" spacing={1}>
          <Token position={rune} />
          <PositionCard key={rune} position={rune} theme="AllRunes" />
        </Stack>
      ))}
    </>
  );
}

export function AllRunes() {
  const [groupByChains, setGroupByChains] = useState(false);
  const [chain] = useAtom(currentChain);
  const isSingleChain = chain >= 0;
  return isSingleChain ? (
    <Chain />
  ) : (
    <Stack>
      <FormControlLabel
        control={
          <Switch
            checked={groupByChains}
            onChange={(e) => setGroupByChains(e.target.checked)}
          />
        }
        label="Chains"
        sx={{ mb: 1 }}
      />
      {groupByChains ? <Chains /> : <FutharkOrder />}
      <Divider orientation="horizontal" flexItem sx={{ mt: 2, mb: 2 }} />
      <DraggablePositionCards theme="AllRunes" />
    </Stack>
  );
}

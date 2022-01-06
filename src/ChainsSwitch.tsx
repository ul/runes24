import React from "react";
import { useAtom } from "./atom";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { byChains } from "./state";

export function ChainsSwitch() {
  const groupByChains = useAtom(byChains);
  return (
    <FormControlLabel
      control={
        <Switch
          checked={groupByChains}
          onChange={(e) => byChains.reset(e.target.checked)}
        />
      }
      label="Chains"
    />
  );
}

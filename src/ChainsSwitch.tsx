import React from "react";
import { useAtom } from "jotai";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { byChains } from "./state";

export function ChainsSwitch() {
  const [groupByChains, setGroupByChains] = useAtom(byChains);
  return (
    <FormControlLabel
      control={
        <Switch
          checked={groupByChains}
          onChange={(e) => setGroupByChains(e.target.checked)}
        />
      }
      label="Chains"
    />
  );
}

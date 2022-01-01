import Stack from "@mui/material/Stack";
import React from "react";
import { Rune } from "./state";
import { Token } from "./Token";

export function RunesOrder({
  runes,
  onClick,
}: {
  runes: Rune[];
  onClick: (rune: Rune) => void;
}) {
  return (
    <Stack direction="row" sx={{ flexWrap: "wrap" }}>
      {runes.map((rune: Rune) => (
        <Token key={rune} onClick={() => onClick(rune)} position={rune} />
      ))}
    </Stack>
  );
}

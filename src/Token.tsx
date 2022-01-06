import React, { memo } from "react";
import { useAtom } from "jotai";
import Paper from "@mui/material/Paper";
import {
  runeColor,
  slotByPosition,
  isReversedByPosition,
  RuneOrSum,
} from "./state";

export const Token = memo(function Token({
  onClick,
  position,
  noColor,
}: {
  position: RuneOrSum;
  onClick?: () => void;
  noColor?: boolean;
}) {
  const [slotValue] = useAtom(slotByPosition(position));
  const [color] = useAtom(runeColor(position));
  const [rx] = useAtom(isReversedByPosition(position));
  const meaning = slotValue?.meaning;
  return (
    <Paper
      className={`token rune${onClick ? " pointer" : ""}`}
      onClick={onClick}
      sx={{
        backgroundColor: noColor ? null : color || null,
      }}
      elevation={noColor ? 0 : 1}
    >
      <sup>{position}</sup>
      <span className={rx ? "reversed" : undefined}>{meaning}</span>
    </Paper>
  );
});

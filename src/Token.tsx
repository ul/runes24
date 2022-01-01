import Paper from "@mui/material/Paper";
import { useAtom } from "jotai";
import React from "react";
import { currentSpread, Rune, runeColors } from "./state";

export function Token({
  onClick,
  position,
}: {
  position: Rune;
  onClick?: () => void;
}) {
  const [spread] = useAtom(currentSpread);
  const [colors] = useAtom(runeColors);
  const slot = spread?.circle.find((s) => s.position === position);
  const meaning = slot?.meaning;
  return (
    <Paper
      className={`token rune${onClick ? " pointer" : ""}`}
      onClick={onClick}
      sx={{
        backgroundColor: colors[position] || null,
      }}
    >
      <sup>{position}</sup>
      <span
        className={meaning && spread?.rx.includes(meaning) ? "reversed" : null}
      >
        {meaning}
      </span>
    </Paper>
  );
}

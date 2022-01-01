import Stack from "@mui/material/Stack";
import { useAtom } from "jotai";
import React from "react";
import { descriptions, readings, Rune } from "./state";
import { TextEditor } from "./TextEditor";

export function PositionCard({
  position,
  theme,
}: {
  position: Rune;
  theme: string;
}) {
  const [spreadReadings, setReadings] = useAtom(readings);
  const [desc, setDesc] = useAtom(descriptions);
  const themeDesc = desc[theme] || {};
  const themeReadings = spreadReadings[theme] || {};
  return (
    <Stack flexGrow={1}>
      <TextEditor
        className="text-editor-theme-description"
        content={themeDesc[position]}
        onChange={(json: any) => {
          setDesc({
            ...desc,
            [theme]: { ...themeDesc, [position]: json },
          });
        }}
      />
      <TextEditor
        content={themeReadings[position]}
        onChange={(json: any) => {
          setReadings({
            ...spreadReadings,
            [theme]: { ...themeReadings, [position]: json },
          });
        }}
      />
    </Stack>
  );
}

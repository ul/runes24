import React, { memo, useCallback } from "react";
import { useAtom } from "jotai";
import Stack from "@mui/material/Stack";
import { TextEditor } from "./TextEditor";
import { themeReading, Rune, themeDescription } from "./state";

export const PositionCard = memo(function PositionCard({
  position,
  theme,
}: {
  position: Rune;
  theme: string;
}) {
  const [reading, setReading] = useAtom(themeReading([theme, position]));
  const [desc, setDesc] = useAtom(themeDescription([theme, position]));
  const updateDesc = useCallback((json: any) => setDesc(json), [setDesc]);
  const updateReading = useCallback(
    (json: any) => setReading(json),
    [setReading]
  );
  return (
    <Stack flexGrow={1}>
      <TextEditor
        className="text-editor-theme-description"
        content={desc}
        onChange={updateDesc}
      />
      <TextEditor content={reading} onChange={updateReading} />
    </Stack>
  );
});

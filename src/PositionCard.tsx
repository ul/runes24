import React, { memo, useCallback } from "react";
import { useAtom } from "./atom";
import Stack from "@mui/material/Stack";
import { TextEditor } from "./TextEditor";
import {
  themeReading,
  RuneOrSum,
  themeDescription,
  setThemeDescription,
  setThemeReading,
} from "./state";

export const PositionCard = memo(function PositionCard({
  position,
  theme,
}: {
  position: RuneOrSum;
  theme: string;
}) {
  const reading = useAtom(themeReading(theme, position));
  const desc = useAtom(themeDescription(theme, position));
  const updateDesc = useCallback(
    (json: any) => setThemeDescription(theme, position, json),
    [theme, position]
  );
  const updateReading = useCallback(
    (json: any) => setThemeReading(theme, position, json),
    [theme, position]
  );
  return (
    <Stack flexGrow={1}>
      {position !== "∑" ? (
        <TextEditor
          className="text-editor-theme-description"
          content={desc}
          onChange={updateDesc}
        />
      ) : null}
      <TextEditor content={reading} onChange={updateReading} />
    </Stack>
  );
});

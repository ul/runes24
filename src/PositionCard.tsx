import React, { memo, useCallback } from "react";
import { useAtom } from "./atom";
import Stack from "@mui/material/Stack";
import { TextEditor } from "./TextEditor";
import { Doc, RuneOrSum, Sum } from "./model";
import {
  themeReading,
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
    (doc: Doc) => setThemeDescription(theme, position, doc),
    [theme, position],
  );
  const updateReading = useCallback(
    (doc: Doc) => setThemeReading(theme, position, doc),
    [theme, position],
  );
  return (
    <Stack sx={{ flexGrow: 1 }}>
      {position !== Sum ? (
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

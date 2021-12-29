import React from "react";
import { useAtom } from "jotai";
import TextField from "@mui/material/TextField";
import DatePicker from "@mui/lab/DatePicker";
import Autocomplete from "@mui/material/Autocomplete";
import { currentSpread, canvasSize } from "./state";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import { Canvas } from "./Canvas";

export function EditSpread() {
  const [spread, setSpread] = useAtom(currentSpread);
  const [canvasSizeValue, setCanvasSize] = useAtom(canvasSize);
  if (!spread) return null;
  // TODO
  const querents = [{ label: "Ruslan" }, { label: "Katherine" }];
  return (
    <Stack spacing={1} p={2}>
      <Stack direction="row" spacing={2}>
        <TextField
          variant="standard"
          label="Topic"
          sx={{ flex: 3, mr: 1 }}
          value={spread.topic}
          onChange={(e) => setSpread({ ...spread, topic: e.target.value })}
        />
        <DatePicker
          label="From"
          inputFormat="DD/MM/YY"
          mask="__/__/__"
          value={spread.date}
          onChange={(date: Date) => {
            setSpread({ ...spread, date: date.valueOf() });
          }}
          renderInput={(params) => (
            <TextField variant="standard" sx={{ flex: 2, mr: 1 }} {...params} />
          )}
        />
        <Autocomplete
          options={querents}
          onChange={(_, value) => {
            setSpread({
              ...spread,
              querent:
                typeof value === "string"
                  ? value
                  : value === null
                  ? ""
                  : value.label,
            });
          }}
          value={querents.find((x) => x.label === spread.querent) || null}
          sx={{ flex: 3, mr: 1 }}
          renderInput={(params) => (
            <TextField variant="standard" {...params} label="Querent" />
          )}
        />
      </Stack>
      <Slider
        value={canvasSizeValue}
        min={200}
        max={1600}
        step={10}
        onChange={(e) => setCanvasSize(e.target.value)}
      />
      <Canvas />
    </Stack>
  );
}

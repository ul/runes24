import React from "react";
import { useAtom } from "./atom";
import Autocomplete from "@mui/material/Autocomplete";
import DatePicker from "@mui/lab/DatePicker";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { filters, Futhark, querents, Rune, themeNames } from "./state";

export function SpreadsFilter() {
  const f = useAtom(filters);
  const allQuerents = useAtom(querents);
  const allThemes = useAtom(themeNames);
  return (
    <Stack direction="row" spacing={2}>
      <Autocomplete
        options={allQuerents}
        onChange={(_, value) => {
          filters.reset({
            ...f,
            querent: typeof value === "string" ? value : value?.label ?? "",
          });
        }}
        value={allQuerents.find((x) => x.label === f.querent) || null}
        sx={{ flex: 3 }}
        renderInput={(params) => (
          <TextField variant="standard" {...params} label="Querent" />
        )}
      />
      <TextField
        variant="standard"
        label="Title"
        sx={{ flex: 3 }}
        value={f.title}
        onChange={(e) => filters.reset({ ...f, title: e.target.value })}
      />
      <DatePicker
        label="From"
        inputFormat="DD/MM/YY"
        mask="__/__/__"
        value={f.fromDate}
        onChange={(date) => {
          filters.reset({ ...f, fromDate: date?.valueOf() ?? null });
        }}
        renderInput={(params) => (
          <TextField variant="standard" sx={{ flex: 2 }} {...params} />
        )}
      />
      <DatePicker
        label="To"
        inputFormat="DD/MM/YY"
        mask="__/__/__"
        value={f.toDate}
        onChange={(date) => {
          filters.reset({ ...f, toDate: date?.valueOf() ?? null });
        }}
        renderInput={(params) => (
          <TextField variant="standard" sx={{ flex: 2 }} {...params} />
        )}
      />
      <FormControl variant="standard" sx={{ flex: 2 }}>
        <InputLabel id="theme-select-label">Theme</InputLabel>
        <Select
          value={f.theme}
          labelId="theme-select-label"
          label="Theme"
          onChange={(e) => {
            filters.reset({ ...f, theme: e.target.value });
          }}
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="AllRunes">All Runes</MenuItem>
          {allThemes.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl variant="standard" sx={{ flex: 1 }}>
        <InputLabel id="position-select-label">Position</InputLabel>
        <Select
          value={f.position || ""}
          labelId="position-select-label"
          label="Position"
          onChange={(e) => {
            filters.reset({ ...f, position: e.target.value as Rune | null });
          }}
        >
          <MenuItem value="">None</MenuItem>
          {Futhark.map((rune) => (
            <MenuItem key={rune} value={rune}>
              {rune}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl variant="standard" sx={{ flex: 1 }}>
        <InputLabel id="meaning-select-label">Meaning</InputLabel>
        <Select
          value={f.meaning || ""}
          labelId="meaning-select-label"
          label="Meaning"
          onChange={(e) => {
            filters.reset({ ...f, meaning: e.target.value as Rune | null });
          }}
        >
          <MenuItem value="">None</MenuItem>
          {Futhark.map((rune) => (
            <MenuItem key={rune} value={rune}>
              {rune}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

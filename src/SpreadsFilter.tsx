import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import DatePicker from "@mui/lab/DatePicker";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { filters, Futhark } from "./state";
import { useAtom } from "jotai";
import Stack from "@mui/material/Stack";

export function SpreadsFilter() {
  const [f, setFilters] = useAtom(filters);
  // TODO
  const querents = [{ label: "Ruslan" }, { label: "Katherine" }];
  return (
    <Stack direction="row" spacing={2}>
      <TextField
        variant="standard"
        label="Topic"
        sx={{ flex: 3 }}
        value={f.topic}
        onChange={(e) => setFilters({ ...f, topic: e.target.value })}
      />
      <DatePicker
        label="From"
        inputFormat="DD/MM/YY"
        mask="__/__/__"
        value={f.fromDate}
        onChange={(date: Date) => {
          setFilters({ ...f, fromDate: date.valueOf() });
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
        onChange={(date: Date) => {
          setFilters({ ...f, toDate: date.valueOf() });
        }}
        renderInput={(params) => (
          <TextField variant="standard" sx={{ flex: 2 }} {...params} />
        )}
      />
      <Autocomplete
        options={querents}
        onChange={(_, value) => {
          setFilters({
            ...f,
            querent:
              typeof value === "string"
                ? value
                : value === null
                ? ""
                : value.label,
          });
        }}
        value={querents.find((x) => x.label === f.querent) || null}
        sx={{ flex: 3 }}
        renderInput={(params) => (
          <TextField variant="standard" {...params} label="Querent" />
        )}
      />
      <FormControl variant="standard" sx={{ flex: 2 }}>
        <InputLabel id="aspect-select-label">Aspect</InputLabel>
        <Select
          value={f.aspect}
          labelId="aspect-select-label"
          label="Aspect"
          onChange={(e) => {
            setFilters({ ...f, aspect: e.target.value });
          }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Money">Money</MenuItem>
          <MenuItem value="Love">Love</MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="standard" sx={{ flex: 1 }}>
        <InputLabel id="position-select-label">Position</InputLabel>
        <Select
          value={f.position === null ? "" : f.position}
          labelId="position-select-label"
          label="Position"
          onChange={(e) => {
            setFilters({ ...f, position: e.target.value });
          }}
        >
          <MenuItem value="">None</MenuItem>
          {Futhark.map((rune, idx) => (
            <MenuItem key={rune} value={idx}>
              {rune}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl variant="standard" sx={{ flex: 1 }}>
        <InputLabel id="meaning-select-label">Meaning</InputLabel>
        <Select
          value={f.meaning === null ? "" : f.meaning}
          labelId="meaning-select-label"
          label="Meaning"
          onChange={(e) => {
            setFilters({ ...f, meaning: e.target.value });
          }}
        >
          <MenuItem value="">None</MenuItem>
          {Futhark.map((rune, idx) => (
            <MenuItem key={rune} value={idx}>
              {rune}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

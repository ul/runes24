import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import DatePicker from "@mui/lab/DatePicker";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { filters, futhark } from "./state";
import { useAtom } from "jotai";

export function SpreadsFilter() {
  const [f, setFilters] = useAtom(filters);
  // TODO
  const querents = [{ label: "Ruslan" }, { label: "Katherine" }];
  return (
    <>
      <TextField
        variant="standard"
        label="Topic"
        sx={{ flex: 3, mr: 1 }}
        value={f.topic}
        onChange={(e) => setFilters({ ...f, topic: e.target.value })}
      />
      <DatePicker
        label="From"
        value={f.fromDate}
        onChange={(fromDate) => {
          setFilters({ ...f, fromDate });
        }}
        renderInput={(params) => (
          <TextField variant="standard" sx={{ flex: 2, mr: 1 }} {...params} />
        )}
      />
      <DatePicker
        label="To"
        value={f.toDate}
        onChange={(toDate) => {
          setFilters({ ...f, toDate });
        }}
        renderInput={(params) => (
          <TextField variant="standard" sx={{ flex: 2, mr: 1 }} {...params} />
        )}
      />
      <Autocomplete
        options={querents}
        onChange={(_, value) => {
          setFilters({
            ...f,
            querent: typeof value === "string" ? value : value.label,
          });
        }}
        value={querents.find((x) => x.label === f.querent)}
        sx={{ flex: 3, mr: 1 }}
        renderInput={(params) => (
          <TextField variant="standard" {...params} label="Querent" />
        )}
      />
      <FormControl variant="standard" sx={{ flex: 2, mr: 1 }}>
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
      <FormControl variant="standard" sx={{ flex: 1, mr: 1 }}>
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
          {futhark.map((rune, idx) => (
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
          {futhark.map((rune, idx) => (
            <MenuItem key={rune} value={idx}>
              {rune}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}

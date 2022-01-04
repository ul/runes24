import React from "react";
import { useAtom } from "jotai";
import TextField from "@mui/material/TextField";
import DatePicker from "@mui/lab/DatePicker";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Icon from "@mui/material/Icon";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import { currentSpread, querents } from "./state";

export function SpreadMeta() {
  const [spread, setSpread] = useAtom(currentSpread);
  const [allQuerents] = useAtom(querents);
  if (!spread) return null;
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Autocomplete
        freeSolo
        options={allQuerents}
        onChange={(_, value) => {
          setSpread({
            ...spread,
            querent: typeof value === "string" ? value : value?.label ?? "",
          });
        }}
        value={allQuerents.find((x) => x.label === spread.querent) || null}
        sx={{ flex: 3, mr: 1 }}
        renderInput={(params) => (
          <TextField variant="standard" {...params} label="Querent" />
        )}
      />
      <TextField
        variant="standard"
        label="Title"
        sx={{ flex: 3, mr: 1 }}
        value={spread.title}
        onChange={(e) => setSpread({ ...spread, title: e.target.value })}
      />
      <DatePicker
        label="From"
        inputFormat="DD/MM/YY"
        mask="__/__/__"
        value={spread.date}
        onChange={(date) => {
          setSpread({ ...spread, date: date?.valueOf() ?? Date.now() });
        }}
        renderInput={(params) => (
          <TextField variant="standard" sx={{ flex: 2, mr: 1 }} {...params} />
        )}
      />
      <Switch
        checked={spread.locked}
        onChange={(e) => {
          setSpread({ ...spread, locked: e.target.checked });
        }}
        icon={
          <Icon
            fontSize="small"
            component={LockOpenIcon}
            color="primary"
            sx={{
              backgroundColor: "#fff",
              borderRadius: "50%",
            }}
          />
        }
        checkedIcon={
          <Icon
            fontSize="small"
            component={LockIcon}
            color="primary"
            sx={{
              backgroundColor: "#fff",
              borderRadius: "50%",
            }}
          />
        }
      />
    </Stack>
  );
}

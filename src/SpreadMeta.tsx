import React from "react";
import { useAtom } from "./atom";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Icon from "@mui/material/Icon";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import { DateInput } from "./DateInput";
import { currentSpread, updateCurrentSpread, querents } from "./state";

export function SpreadMeta() {
  const spread = useAtom(currentSpread);
  const allQuerents = useAtom(querents);
  if (!spread) return null;
  return (
    <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
      <Autocomplete
        freeSolo
        options={allQuerents}
        // Save what is typed, not only what is picked from the list.
        inputValue={spread.querent}
        onInputChange={(_, value) =>
          updateCurrentSpread((spread) => ({ ...spread, querent: value }))
        }
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
        onChange={(e) =>
          updateCurrentSpread((spread) => ({
            ...spread,
            title: e.target.value,
          }))
        }
      />
      <DateInput
        label="Date"
        value={spread.date}
        onChange={(date) => {
          // Keep the old date while the input is incomplete or invalid.
          if (date === null) return;
          updateCurrentSpread((spread) => ({ ...spread, date }));
        }}
        sx={{ flex: 2, mr: 1 }}
      />
      <Switch
        checked={spread.locked}
        onChange={(e) =>
          updateCurrentSpread((spread) => ({
            ...spread,
            locked: e.target.checked,
          }))
        }
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

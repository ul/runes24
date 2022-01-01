import React, { useState } from "react";
import { useAtom } from "jotai";
import TextField from "@mui/material/TextField";
import DatePicker from "@mui/lab/DatePicker";
import Autocomplete from "@mui/material/Autocomplete";
import {
  currentSpread,
  canvasSize,
  querents,
  route,
  Screen,
  deleteSpread,
} from "./state";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import { Canvas } from "./Canvas";
import { Reading } from "./Reading";
import Switch from "@mui/material/Switch";
import Icon from "@mui/material/Icon";
import DeleteIcon from "@mui/icons-material/Delete";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { useUpdateAtom } from "jotai/utils";

export function EditSpread() {
  const [spread, setSpread] = useAtom(currentSpread);
  const [canvasSizeValue, setCanvasSize] = useAtom(canvasSize);
  const [allQuerents] = useAtom(querents);
  const [_, setRoute] = useAtom(route);
  const doDeleteSpread = useUpdateAtom(deleteSpread);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  if (!spread) return null;
  return (
    <Stack spacing={1} p={2}>
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
          onChange={(date: Date) => {
            setSpread({ ...spread, date: date.valueOf() });
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
      <Slider
        value={canvasSizeValue}
        min={200}
        max={1600}
        step={10}
        onChange={(e) => setCanvasSize(e.target.value)}
      />
      <Canvas />
      <Reading />
      <Stack direction="row" justifyContent="center">
        <Button
          variant="outlined"
          onClick={() => setDeleteConfirmationOpen(true)}
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
      </Stack>
      <Dialog
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Really delete the spread?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This operation is <em>irreversible.</em>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => setDeleteConfirmationOpen(false)}
          >
            Cancel
          </Button>
          <Button
            color="secondary"
            onClick={() => {
              setDeleteConfirmationOpen(false);
              setRoute({ screen: Screen.SpreadsList });
              doDeleteSpread(spread.id);
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

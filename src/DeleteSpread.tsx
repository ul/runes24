import React, { useState } from "react";
import { useAtom } from "jotai";
import { currentSpread, route, Screen, deleteSpread } from "./state";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { useUpdateAtom } from "jotai/utils";

export function DeleteSpread() {
  const [spread] = useAtom(currentSpread);
  const [_, setRoute] = useAtom(route);
  const doDeleteSpread = useUpdateAtom(deleteSpread);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  if (!spread) return null;
  return (
    <>
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
    </>
  );
}

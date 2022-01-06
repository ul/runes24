import React, { useState } from "react";
import { useAtom } from "./atom";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { currentSpreadId, route, Screen, deleteSpread } from "./state";

export function DeleteSpread() {
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const spreadId = useAtom(currentSpreadId);
  if (!spreadId) return null;
  return (
    <>
      <Stack direction="row" justifyContent="center">
        <IconButton
          color="primary"
          onClick={() => setDeleteConfirmationOpen(true)}
        >
          <DeleteIcon />
        </IconButton>
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
              route.reset({ screen: Screen.SpreadsList });
              deleteSpread(spreadId);
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

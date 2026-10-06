import React from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { useAtom } from "./atom";
import { saveError } from "./persistence";
import { retrySave } from "./state";

export function SaveError() {
  const error = useAtom(saveError);
  if (!error) return null;
  return (
    <Alert
      severity="error"
      action={
        <Button color="inherit" onClick={() => retrySave()}>
          Retry
        </Button>
      }
    >
      Changes are not saved: {error}
    </Alert>
  );
}

import React from "react";
import { useAtom } from "./atom";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import LinearProgress from "@mui/material/LinearProgress";
import { route, Screen } from "./state";
import { SpreadsList } from "./SpreadsList";
import { EditSpread } from "./EditSpread";

export function Router() {
  const currentRoute = useAtom(route);
  switch (currentRoute.screen) {
    case Screen.EditSpread:
      return <EditSpread />;
    case Screen.SpreadsList:
      return <SpreadsList />;
    case Screen.LoadError:
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          <AlertTitle>Saved spreads could not be loaded</AlertTitle>
          {currentRoute.message}
          <br />
          Nothing has been changed on disk. Fix or restore the file (a backup of
          the previous save is kept next to it as{" "}
          <code>state.json.snap.bak</code>) and restart the app.
        </Alert>
      );
    default:
      return <LinearProgress />;
  }
}

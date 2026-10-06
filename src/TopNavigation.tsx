import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import { useAtom } from "./atom";
import { Screen, route, createSpread, navigate } from "./state";

export function TopNavigation() {
  const currentRoute = useAtom(route);
  const ready =
    currentRoute.screen === Screen.SpreadsList ||
    currentRoute.screen === Screen.EditSpread;
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton
          color="inherit"
          sx={{ mr: 2 }}
          disabled={!ready}
          onClick={() => {
            const id = createSpread();
            navigate({ screen: Screen.EditSpread, spreadId: id });
          }}
        >
          <AddIcon />
        </IconButton>
        <Typography
          align="center"
          variant="h6"
          color="inherit"
          component="div"
          sx={{ flex: 1 }}
        >
          Runes Circle
        </Typography>
        {currentRoute.screen === Screen.EditSpread ? (
          <IconButton
            color="inherit"
            onClick={() => navigate({ screen: Screen.SpreadsList })}
          >
            <ListIcon />
          </IconButton>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}

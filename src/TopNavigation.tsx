import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import { useAtom } from "jotai";
import { Route, route } from "./state";

export function TopNavigation() {
  const [, setRoute] = useAtom(route);
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          color="inherit"
          sx={{ mr: 2 }}
          onClick={() => {
            setRoute(Route.SpreadsList);
          }}
        >
          <ListIcon />
        </IconButton>
        <IconButton
          edge="start"
          color="inherit"
          sx={{ mr: 2 }}
          onClick={() => {
            setRoute(Route.CreateSpread);
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
          24 Runes
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

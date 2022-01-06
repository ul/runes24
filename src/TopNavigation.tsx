import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import { useAtom } from "./atom";
import { Screen, route, createSpread } from "./state";
import { nanoid } from "nanoid";

export function TopNavigation() {
  const currentRoute = useAtom(route);
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton
          color="inherit"
          sx={{ mr: 2 }}
          onClick={() => {
            const id = nanoid();
            createSpread(id);
            route.reset({ screen: Screen.EditSpread, spreadId: id });
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
        {currentRoute.screen !== Screen.SpreadsList ? (
          <IconButton
            color="inherit"
            onClick={() => {
              route.reset({ screen: Screen.SpreadsList });
            }}
          >
            <ListIcon />
          </IconButton>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}

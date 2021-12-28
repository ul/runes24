import React, { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import DateAdapter from "@mui/lab/AdapterDayjs";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { invoke } from "@tauri-apps/api/tauri";
import { Provider, useAtom } from "jotai";
import { persistentState } from "./state";
import { TopNavigation } from "./TopNavigation";
import { Router } from "./Router";
import Box from "@mui/material/Box";

export function App() {
  const [, setPersistentState] = useAtom(persistentState);
  useEffect(() => {
    (async () => {
      const initialState = JSON.parse(await invoke("get_initial_state", {}));
      setPersistentState(initialState);
    })();
  }, []);

  return (
    <Provider>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <CssBaseline />
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <TopNavigation />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              mt: 1,
            }}
          >
            <Router />
          </Box>
        </Box>
      </LocalizationProvider>
    </Provider>
  );
}

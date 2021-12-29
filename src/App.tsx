import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import DateAdapter from "@mui/lab/AdapterDayjs";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { Provider } from "jotai";
import { TopNavigation } from "./TopNavigation";
import { Router } from "./Router";
import Stack from "@mui/material/Stack";

export function App() {
  return (
    <Provider>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <CssBaseline />
        <Stack flex={1}>
          <TopNavigation />
          <Stack mt={1} flex={1}>
            <Router />
          </Stack>
        </Stack>
      </LocalizationProvider>
    </Provider>
  );
}

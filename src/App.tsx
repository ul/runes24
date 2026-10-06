import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Stack from "@mui/material/Stack";
import { TopNavigation } from "./TopNavigation";
import { Router } from "./Router";
import { Footer } from "./Footer";
import { ErrorBoundary } from "./ErrorBoundary";
import { SaveError } from "./SaveError";

export function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CssBaseline />
      <Stack sx={{ flex: 1 }}>
        <TopNavigation />
        <SaveError />
        <Stack sx={{ flex: 1, mt: 1 }}>
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </Stack>
        <Footer />
      </Stack>
    </LocalizationProvider>
  );
}

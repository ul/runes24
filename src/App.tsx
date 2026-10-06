import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import DateAdapter from "@mui/lab/AdapterDayjs";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import Stack from "@mui/material/Stack";
import { TopNavigation } from "./TopNavigation";
import { Router } from "./Router";
import { Footer } from "./Footer";
import { ErrorBoundary } from "./ErrorBoundary";
import { SaveError } from "./SaveError";

export function App() {
  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <CssBaseline />
      <Stack flex={1}>
        <TopNavigation />
        <SaveError />
        <Stack mt={1} flex={1}>
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </Stack>
        <Footer />
      </Stack>
    </LocalizationProvider>
  );
}

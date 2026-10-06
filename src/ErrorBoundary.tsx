import React from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import { navigate, Screen } from "./state";

/** Shows render errors instead of a blank window. Data is saved separately,
 *  so going back to the list is safe. */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <Alert
        severity="error"
        sx={{ m: 2 }}
        action={
          <Button
            color="inherit"
            onClick={() => {
              navigate({ screen: Screen.SpreadsList });
              this.setState({ error: null });
            }}
          >
            Back to list
          </Button>
        }
      >
        <AlertTitle>Something went wrong</AlertTitle>
        {error.message}
      </Alert>
    );
  }
}

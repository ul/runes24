import React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Paper from "@mui/material/Paper";
import { AllRunes } from "./AllRunes";
import { Theme } from "./Theme";
import { AllRunes as AllRunesTheme } from "./model";
import { themeNames } from "./state";

export function Reading() {
  const [activeTab, setActiveTab] = React.useState(AllRunesTheme);
  const themes = themeNames;

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <Paper>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          variant="scrollable"
          aria-label="Reading themes"
        >
          <Tab label="All Runes" value={AllRunesTheme} />
          {themes.map((name) => (
            <Tab key={name} label={name} value={name} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ p: 3 }} role="tabpanel">
        {activeTab === AllRunesTheme ? (
          <AllRunes />
        ) : (
          <Theme key={activeTab} theme={activeTab} />
        )}
      </Box>
    </Paper>
  );
}

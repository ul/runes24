import React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Paper from "@mui/material/Paper";
import { AllRunes } from "./AllRunes";
import { Theme } from "./Theme";
import { themes } from "./state";
import { useAtom } from "jotai";

export function Reading() {
  const [activeTab, setActiveTab] = React.useState("AllRunes");
  const [themesValue] = useAtom(themes);

  const handleChange = (_: Event, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <Paper>
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="Reading themes">
            <Tab label="All Runes" value="AllRunes" />
            {themesValue.map((theme) => (
              <Tab key={theme.name} label={theme.name} value={theme.name} />
            ))}
          </TabList>
        </Box>
        <TabPanel value="AllRunes">
          <AllRunes />
        </TabPanel>
        {themesValue.map((theme) => (
          <TabPanel key={theme.name} value={theme.name}>
            <Theme theme={theme} />
          </TabPanel>
        ))}
      </TabContext>
    </Paper>
  );
}

import React from "react";
import { useAtom } from "./atom";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Paper from "@mui/material/Paper";
import { AllRunes } from "./AllRunes";
import { Theme } from "./Theme";
import { themeNames } from "./state";

export function Reading() {
  const [activeTab, setActiveTab] = React.useState("AllRunes");
  const themes = useAtom(themeNames);

  const handleChange = (_: Event, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <Paper>
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="Reading themes">
            <Tab label="All Runes" value="AllRunes" />
            {themes.map((name) => (
              <Tab key={name} label={name} value={name} />
            ))}
          </TabList>
        </Box>
        <TabPanel value="AllRunes">
          <AllRunes />
        </TabPanel>
        {themes.map((name) => (
          <TabPanel key={name} value={name}>
            <Theme theme={name} />
          </TabPanel>
        ))}
      </TabContext>
    </Paper>
  );
}

import React from "react";
import { SpreadsFilter } from "./SpreadsFilter";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useAtom } from "jotai";
import { filteredSpreads } from "./state";

const columns: GridColDef[] = [
  {
    field: "date",
    headerName: "Date",
    type: "date",
    width: 100,
  },
  {
    field: "topic",
    headerName: "Topic",
    width: 500,
  },
  {
    field: "querent",
    headerName: "Querent",
    width: 300,
  },
];

export function SpreadsList() {
  const [rows] = useAtom(filteredSpreads);
  return (
    <>
      <Box sx={{ p: 1, display: "flex" }}>
        <SpreadsFilter />
      </Box>
      <Box sx={{ p: 1, flex: 1 }}>
        <DataGrid rows={rows} columns={columns} autoPageSize />
      </Box>
    </>
  );
}

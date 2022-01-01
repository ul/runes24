import React from "react";
import { SpreadsFilter } from "./SpreadsFilter";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useAtom } from "jotai";
import { useUpdateAtom } from "jotai/utils";
import { filteredSpreads, route, Screen } from "./state";
import dayjs from "dayjs";
import Stack from "@mui/material/Stack";

const columns: GridColDef[] = [
  {
    field: "querent",
    headerName: "Querent",
    width: 300,
  },
  {
    field: "title",
    headerName: "Title",
    width: 500,
  },
  {
    field: "date",
    headerName: "Date",
    type: "date",
    width: 110,
    valueFormatter: ({ value }) => dayjs(value as number).format("DD/MM/YY"),
  },
];

export function SpreadsList() {
  const [rows] = useAtom(filteredSpreads);
  const setRoute = useUpdateAtom(route);
  return (
    <Stack spacing={1} flex={1} p={1}>
      <SpreadsFilter />
      <DataGrid
        rows={rows}
        columns={columns}
        autoPageSize
        onRowClick={({ id }) => {
          setRoute({ screen: Screen.EditSpread, spreadId: id as string });
        }}
      />
    </Stack>
  );
}

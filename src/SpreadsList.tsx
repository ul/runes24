import React from "react";
import { SpreadsFilter } from "./SpreadsFilter";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useAtom } from "./atom";
import { filteredSpreads, navigate, Screen, spreadListSort } from "./state";
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
    type: "number",
    align: "left",
    headerAlign: "left",
    width: 110,
    valueFormatter: (value: number) => dayjs(value).format("DD/MM/YY"),
  },
];

export function SpreadsList() {
  const rows = useAtom(filteredSpreads);
  const sortModel = useAtom(spreadListSort);
  return (
    <Stack sx={{ flex: 1, p: 1 }} spacing={1}>
      <SpreadsFilter />
      <DataGrid
        rows={rows}
        columns={columns}
        autoPageSize
        sortModel={sortModel}
        onSortModelChange={(newModel) => spreadListSort.reset(newModel)}
        onRowClick={({ id }) => {
          navigate({ screen: Screen.EditSpread, spreadId: id as string });
        }}
      />
    </Stack>
  );
}

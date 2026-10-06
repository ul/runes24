import React from "react";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { SxProps, Theme } from "@mui/material/styles";

/** Date field working in epoch milliseconds. Reports `null` for empty,
 *  incomplete or invalid input. */
export function DateInput({
  label,
  value,
  onChange,
  sx,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  sx?: SxProps<Theme>;
}) {
  return (
    <DatePicker
      label={label}
      format="DD/MM/YY"
      value={value === null ? null : dayjs(value)}
      onChange={(date) => onChange(date?.isValid() ? date.valueOf() : null)}
      slotProps={{ textField: { variant: "standard", sx } }}
    />
  );
}

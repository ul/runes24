import React from "react";
import { useAtom } from "./atom";
import { route, Screen } from "./state";
import { SpreadsList } from "./SpreadsList";
import { EditSpread } from "./EditSpread";

export function Router() {
  const currentRoute = useAtom(route);
  switch (currentRoute.screen) {
    case Screen.EditSpread:
      return <EditSpread />;
    case Screen.SpreadsList:
    default:
      return <SpreadsList />;
  }
}

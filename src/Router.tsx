import React from "react";
import { useAtom } from "jotai";
import { route, Route } from "./state";
import { SpreadsList } from "./SpreadsList";

export function Router() {
  const [currentRoute] = useAtom(route);
  switch (currentRoute) {
    case Route.CreateSpread:
      return <div>Create the create spread page, yo</div>;
    case Route.SpreadsList:
    default:
      return <SpreadsList />;
  }
}

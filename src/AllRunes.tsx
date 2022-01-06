import React from "react";
import { useAtom } from "./atom";
import { Chain } from "./Chain";
import { Chains } from "./Chains";
import { FutharkOrder } from "./FutharkOrder";
import { byChains, currentChain } from "./state";

export function AllRunes() {
  const chain = useAtom(currentChain);
  const groupByChains = useAtom(byChains);
  return typeof chain === "undefined" ? (
    groupByChains ? (
      <Chains />
    ) : (
      <FutharkOrder />
    )
  ) : (
    <Chain chain={chain} />
  );
}

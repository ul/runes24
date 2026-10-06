import React from "react";
import { useAtom } from "./atom";
import { Chain } from "./Chain";
import { Chains } from "./Chains";
import { FutharkOrder } from "./FutharkOrder";
import { byChains, selectedChain } from "./state";

export function AllRunes() {
  const chain = useAtom(selectedChain);
  const groupByChains = useAtom(byChains);
  if (chain) return <Chain chain={chain} />;
  return groupByChains ? <Chains /> : <FutharkOrder />;
}

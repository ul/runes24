import { atom } from "jotai";
import { invoke } from "@tauri-apps/api/tauri";

export interface Spread {
  id: string; // use nanoid for it?
  date: Date;
  topic: string;
  querent: string;
}

export interface PersistentState {
  version: number;
  spreads: Spread[];
}

export enum Route {
  SpreadsList,
  CreateSpread,
}

export interface Filters {
  topic: string;
  fromDate: Date | null;
  toDate: Date | null;
  querent: string; // or numeric id?
  aspect: string; // or numeric id?
  position: number | null; // index into futhark
  meaning: number | null; // index into futhark
}

const persistentStateRaw = atom<PersistentState>({
  version: 1,
  spreads: [],
});

export const persistentState = atom<PersistentState, PersistentState>(
  (get) => get(persistentStateRaw),
  async (_get, set, data) => {
    await invoke("set_state", { data: JSON.stringify(data) });
    set(persistentStateRaw, data);
  }
);
export const route = atom<Route>(Route.SpreadsList);
export const filters = atom<Filters>({
  topic: "",
  fromDate: null,
  toDate: null,
  querent: "",
  aspect: "",
  position: null,
  meaning: null,
});
export const filteredSpreads = atom<Spread[]>((get) => {
  const { spreads } = get(persistentState);
  const f = get(filters);
  return spreads.filter((s) => {
    if (
      f.topic !== "" &&
      !s.topic.toLowerCase().includes(f.topic.toLowerCase())
    )
      return false;
    if (f.fromDate !== null && s.date < f.fromDate) return false;
    if (f.toDate !== null && s.date > f.toDate) return false;
    if (
      f.querent !== "" &&
      !s.querent.toLowerCase().includes(f.querent.toLowerCase())
    )
      return false;
    // TODO aspect, position, meaning
    return true;
  });
});

export const futhark = [
  "ᚠ",
  "ᚢ",
  "ᚦ",
  "ᚨ",
  "ᚱ",
  "ᚲ",
  "ᚷ",
  "ᚹ",
  "ᚺ",
  "ᚾ",
  "ᛁ",
  "ᛃ",
  "ᛇ",
  "ᛈ",
  "ᛉ",
  "ᛋ",
  "ᛏ",
  "ᛒ",
  "ᛖ",
  "ᛗ",
  "ᛚ",
  "ᛝ",
  "ᛟ",
  "ᛞ",
];

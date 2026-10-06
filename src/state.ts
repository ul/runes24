// Application state: atoms, derived atoms and the actions changing them.

import mapValues from "lodash/mapValues";
import { nanoid } from "nanoid";
import { GridSortModel } from "@mui/x-data-grid";
import { atom, Atom, deatomize, atomFamily } from "./atom";
import {
  AllRunes,
  Chain,
  chainsOf,
  Doc,
  Filters,
  Futhark,
  newSpread,
  parsePersistentState,
  persistentStateVersion,
  PersistentState,
  pinChain,
  Rune,
  RuneOrSum,
  Spread,
  spreadMatches,
  ThemeScheme,
  ThemeTexts,
} from "./model";
import { distance, meaningRuneSize, nearestPoint, Point } from "./geometry";
import { loadState, onExit, startSaving } from "./persistence";
import defaultThemes from "./themes.json";

// ---------------------------------------------------------------- Routing

export enum Screen {
  Loading,
  LoadError,
  SpreadsList,
  EditSpread,
}

export type Route =
  | { screen: Screen.Loading }
  | { screen: Screen.LoadError; message: string }
  | { screen: Screen.SpreadsList }
  | { screen: Screen.EditSpread; spreadId: string };

export const route = atom<Route>({ screen: Screen.Loading });

export function navigate(to: Route) {
  // Chain selection refers to the spread being left.
  selectChain(undefined);
  movingRune.value = undefined;
  route.value = to;
}

// ---------------------------------------------------------------- Themes

/** Themes are part of the app, not of the saved state. Texts are keyed by
 *  theme name, so renaming a theme in themes.json orphans its texts. */
export const themes = defaultThemes as ThemeScheme[];
export const themeNames = themes.map((t) => t.name);

// ---------------------------------------------------------------- Persistent state

export type AtomicTexts = Record<string, Atom<ThemeTexts>>;

/** `Spread` with its frequently changing parts in their own atoms, so that
 *  e.g. typing a reading doesn't recompute everything depending on the circle. */
export interface AtomicSpread {
  id: string;
  date: number;
  title: string;
  querent: string;
  circle: Atom<Chain>;
  rx: Atom<Rune[]>;
  chainPins: Atom<Rune[]>;
  locked: boolean;
  order: Atom<Record<string, Rune[]>>;
  readings: Atom<AtomicTexts>;
}

function atomizeTexts(texts: Record<string, ThemeTexts>): AtomicTexts {
  return mapValues(texts, (x) => atom(x));
}

function atomizeSpread(spread: Spread): Atom<AtomicSpread> {
  return atom<AtomicSpread>({
    ...spread,
    circle: atom(spread.circle),
    rx: atom(spread.rx),
    chainPins: atom(spread.chainPins),
    order: atom(spread.order),
    readings: atom(atomizeTexts(spread.readings)),
  });
}

export const spreads = atom<Record<string, Atom<AtomicSpread>>>({});
export const descriptions = atom<AtomicTexts>({});

const persistentState = atom<PersistentState>(() =>
  deatomize({
    version: persistentStateVersion,
    spreads,
    descriptions,
  }),
);

let persistence: ReturnType<typeof startSaving> | undefined;

(async () => {
  try {
    const json = await loadState();
    if (json !== null) {
      const state = parsePersistentState(json);
      spreads.value = mapValues(state.spreads, atomizeSpread);
      descriptions.value = atomizeTexts(state.descriptions);
    }
    persistence = startSaving(persistentState);
    route.value = { screen: Screen.SpreadsList };
  } catch (e) {
    console.error("Loading failed", e);
    route.value = {
      screen: Screen.LoadError,
      message: e instanceof Error ? e.message : String(e),
    };
  }
})();

onExit(async () => {
  await persistence?.flush();
});

export function retrySave() {
  return persistence?.retry();
}

// ---------------------------------------------------------------- Texts

function setText(
  texts: Atom<AtomicTexts>,
  theme: string,
  position: RuneOrSum,
  doc: Doc,
) {
  const t = texts.value[theme];
  if (t) {
    t.swap((t) => ({ ...t, [position]: doc }));
  } else {
    texts.swap((all) => ({ ...all, [theme]: atom({ [position]: doc }) }));
  }
}

export const themeDescription = atomFamily(
  (theme: string, position: RuneOrSum) =>
    descriptions.value[theme]?.value[position],
);

export function setThemeDescription(
  theme: string,
  position: RuneOrSum,
  doc: Doc,
) {
  setText(descriptions, theme, position, doc);
}

export const themeReading = atomFamily((theme: string, position: RuneOrSum) => {
  return currentReadings.value?.value[theme]?.value[position];
});

export function setThemeReading(theme: string, position: RuneOrSum, doc: Doc) {
  const readings = currentReadings.value;
  if (readings) setText(readings, theme, position, doc);
}

// ---------------------------------------------------------------- Spreads

export function createSpread(): string {
  const id = nanoid();
  spreads.swap((spreads) => ({
    ...spreads,
    [id]: atomizeSpread(newSpread(id)),
  }));
  return id;
}

export function deleteSpread(id: string) {
  spreads.swap(({ [id]: _, ...spreads }) => spreads);
}

export const querents = atom<Array<{ label: string }>>(() => {
  const names = new Set(
    Object.values(spreads.value).map((s) => s.value.querent.trim()),
  );
  names.delete("");
  return Array.from(names)
    .sort((a, b) => a.localeCompare(b))
    .map((label) => ({ label }));
});

export const currentSpreadId = atom<string | undefined>(() => {
  const r = route.value;
  return r.screen === Screen.EditSpread ? r.spreadId : undefined;
});

export const currentSpread = atom<AtomicSpread | undefined>(() => {
  const id = currentSpreadId.value;
  return id ? spreads.value[id]?.value : undefined;
});

export function updateCurrentSpread(f: (x: AtomicSpread) => AtomicSpread) {
  const id = currentSpreadId.value;
  if (!id) return;
  spreads.value[id]?.swap(f);
}

export const currentCircle = atom(() => currentSpread.value?.circle.value);

export const currentReadings = atom(() => currentSpread.value?.readings);

const currentRX = atom(() => currentSpread.value?.rx);

const currentChainPins = atom(() => currentSpread.value?.chainPins);

const currentOrder = atom(() => currentSpread.value?.order);

export const currentSpreadLocked = atom(() => !!currentSpread.value?.locked);

// ---------------------------------------------------------------- Card order

export const themeOrder = atomFamily((theme: string): Rune[] => {
  return (
    currentOrder.value?.value[theme] ||
    themes.find((t) => t.name === theme)?.runes ||
    []
  );
});

export function setThemeOrder(theme: string, newOrder: Rune[]) {
  currentOrder.value?.swap((order) => ({ ...order, [theme]: newOrder }));
}

export function resetOrder() {
  currentOrder.value?.swap((order) => ({ ...order, [AllRunes]: [...Futhark] }));
}

// ---------------------------------------------------------------- Circle

export const slotByPosition = atomFamily((position: RuneOrSum) =>
  currentCircle.value?.find((s) => s.position === position),
);

export const slotByMeaning = atomFamily((meaning: Rune) =>
  currentCircle.value?.find((s) => s.meaning === meaning),
);

export const isReversedByMeaning = atomFamily(
  (meaning: Rune) => !!currentRX.value?.value.includes(meaning),
);

export const isReversedByPosition = atomFamily((position: RuneOrSum) => {
  const meaning = slotByPosition(position).value?.meaning;
  return !!meaning && isReversedByMeaning(meaning).value;
});

export function reverseRune(rune: Rune) {
  if (currentSpreadLocked.value) return;
  currentRX.value?.swap((rx) =>
    rx.includes(rune) ? rx.filter((x) => x !== rune) : [...rx, rune],
  );
}

/** Runes left outside the circle can't stay reversed. */
export function straightenFreeRunes() {
  const runesInCircle = new Set(currentCircle.value?.map((s) => s.meaning));
  currentRX.value?.swap((rx) => rx.filter((rune) => runesInCircle.has(rune)));
}

export const canvasSize = atom<number>(600);
export const movingRune = atom<Rune | undefined>(undefined);
export const movingRuneCoords = atom<Point>([0, 0]);

/** Move the dragged rune to `p`, snapping it into a free slot when close. */
export function snapMovingRune(p: Point) {
  movingRuneCoords.value = p;
  const circle = currentSpread.value?.circle;
  const meaning = movingRune.value;
  if (!circle || !meaning || currentSpreadLocked.value) return;
  const [pp, n] = nearestPoint(p);
  if (distance(p, pp) < meaningRuneSize) {
    const position = Futhark[n];
    if (!circle.value.some((x) => x.position === position)) {
      circle.swap((circle) => [
        ...circle.filter((x) => x.meaning !== meaning),
        { position, meaning },
      ]);
    }
  } else if (circle.value.some((x) => x.meaning === meaning)) {
    circle.swap((circle) => circle.filter((x) => x.meaning !== meaning));
  }
}

// ---------------------------------------------------------------- Chains

export const byChains = atom<boolean>(false);

export const currentChains = atom(() => chainsOf(currentCircle.value ?? []));

/** The selected chain is remembered by one of its positions rather than by
 *  index, so it survives (or cleanly disappears on) changes of the circle. */
const selectedChainRune = atom<Rune | undefined>(undefined);

/** Position the selected chain is temporarily displayed from. */
const temporaryPin = atom<Rune | undefined>(undefined);

export function selectChain(rune: Rune | undefined, pin?: Rune) {
  selectedChainRune.value = rune;
  temporaryPin.value = pin;
}

export function setTemporaryPin(pin: Rune) {
  temporaryPin.value = pin;
}

export const pinnedChains = atom<Chain[]>(() => {
  const chainPins = currentChainPins.value?.value ?? [];
  const tempPin = temporaryPin.value;
  return currentChains.value.map((chain) => {
    const has = (rune: Rune | undefined) =>
      !!rune && chain.some((s) => s.position === rune);
    return pinChain(chain, has(tempPin) ? tempPin : chainPins.find(has));
  });
});

export const selectedChain = atom<Chain | undefined>(() => {
  const rune = selectedChainRune.value;
  if (!rune) return undefined;
  return pinnedChains.value.find((c) => c.some((s) => s.position === rune));
});

/** Make the selected chain always start from `newPin`. */
export function pinSelectedChain(newPin: Rune) {
  const chain = selectedChain.value;
  if (!chain) return;
  const positions = new Set(chain.map((s) => s.position));
  currentChainPins.value?.swap((chainPins) => [
    ...chainPins.filter((rune) => !positions.has(rune)),
    newPin,
  ]);
}

export const runeColors = atom<Partial<Record<RuneOrSum, string>>>(() => {
  const allChains = currentChains.value;
  const n = allChains.length;
  const result: Partial<Record<RuneOrSum, string>> = {};
  allChains.forEach((chain, i) => {
    const hue = Math.round((360 * i + 180) / n) % 360;
    const chainColor = `hsla(${hue},100%,50%,0.25)`;
    for (const { position } of chain) {
      result[position] = chainColor;
    }
  });
  return result;
});

export const runeColor = atomFamily(
  (position: RuneOrSum) => runeColors.value[position],
);

// ---------------------------------------------------------------- Spreads list

export const filters = atom<Filters>({
  title: "",
  fromDate: null,
  toDate: null,
  querent: "",
  theme: "",
  position: null,
  meaning: null,
});

export const filteredSpreads = atom(() => {
  const f = filters.value;
  return Object.values(spreads.value)
    .map((s) => s.value)
    .filter((s) =>
      spreadMatches(
        { ...s, circle: s.circle.value },
        (theme) => s.readings.value[theme]?.value,
        f,
      ),
    );
});

export const spreadListSort = atom<GridSortModel>([
  { field: "date", sort: "desc" },
]);

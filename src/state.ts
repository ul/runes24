import debounce from "lodash/debounce";
import mapValues from "lodash/mapValues";
import { atom, Atom, deatomize, atomFamily, globalSubscriptions } from "./atom";
import defaultThemes from "./themes.json";
import { GridSortModel } from "@mui/x-data-grid";
import { get, set } from "idb-keyval";

export type Point = [number, number];

export const Futhark = [
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
] as const;

export type Rune = typeof Futhark[number];
export type RuneOrSum = Rune | "∑" | "=";

export type Slot = { position: RuneOrSum; meaning: RuneOrSum };
export type Chain = Slot[];

export interface Spread {
  id: string;
  date: number;
  title: string;
  querent: string;
  circle: Chain;
  rx: Array<Rune>;
  chainPins: Array<Rune>;
  locked: boolean;
  order: Record<string, Rune[]>;
  readings: Record<string, Record<Rune, any>>;
}

export interface ThemeScheme {
  name: string;
  runes: Rune[];
}

export type Descriptions = Record<string, Record<Rune, any>>;

// Keep it and all dependencies JSON-serializable,
// no fancy stuff like Sets etc.
export interface PersistentState {
  version: number;
  spreads: Record<string, Spread>;
  descriptions: Descriptions;
}

export enum Screen {
  Loading,
  SpreadsList,
  EditSpread,
}

export interface Loading {
  screen: Screen.Loading;
}

export interface SpreadsList {
  screen: Screen.SpreadsList;
}

export interface EditSpread {
  screen: Screen.EditSpread;
  spreadId: string;
}

export type Route = Loading | SpreadsList | EditSpread;

export interface Filters {
  title: string;
  fromDate: number | null;
  toDate: number | null;
  querent: string;
  theme: string;
  position: Rune | null;
  meaning: Rune | null;
}

export type AtomicDescriptions = Record<string, Atom<Record<Rune, any>>>;

export interface AtomicSpread {
  id: string;
  date: number;
  title: string;
  querent: string;
  circle: Atom<Chain>;
  rx: Atom<Array<Rune>>;
  chainPins: Atom<Array<Rune>>;
  locked: boolean;
  order: Atom<Record<string, Rune[]>>;
  readings: Atom<AtomicDescriptions>;
}

export const route = atom<Route>({ screen: Screen.Loading });

export const spreads = atom<Record<string, Atom<AtomicSpread>>>({});
export const themes = atom<Atom<ThemeScheme>[]>(
  defaultThemes.map((x) => atom(x)) as Atom<ThemeScheme>[]
);
export const descriptions = atom<AtomicDescriptions>({});

export const themeNames = atom(() =>
  themes.value.map((theme) => theme.value.name)
);

const persistentState: Atom<PersistentState> = atom<PersistentState>(() => {
  return deatomize({
    version: 1,
    spreads,
    descriptions,
  });
});

(async () => {
  const initialState: PersistentState | void = await get("runes24");
  if (initialState) {
    spreads.value = mapValues(initialState.spreads, (spread) =>
      atom<AtomicSpread>({
        ...spread,
        circle: atom(spread.circle),
        rx: atom(spread.rx),
        chainPins: atom(spread.chainPins),
        order: atom(spread.order),
        readings: atom(mapValues(spread.readings, atom)),
      } as AtomicSpread)
    );
    descriptions.value = mapValues(initialState.descriptions, (x) => atom(x));
  }
  route.value = { screen: Screen.SpreadsList };
})();

const savePersistentState = debounce(() => {
  set("runes24", persistentState.value);
}, 1000);

globalSubscriptions.subscribe(savePersistentState);

export const themeDescription = atomFamily(
  (theme: string, position: Rune) => descriptions.value[theme]?.value[position]
);

export function setThemeDescription(theme: string, position: Rune, json: any) {
  const t = descriptions.value[theme];
  if (t) {
    t.swap((theme) => ({ ...theme, [position]: json }));
  } else {
    descriptions.swap(
      (readings) =>
        ({
          ...readings,
          [theme]: atom({ [position]: json }),
        } as AtomicDescriptions)
    );
  }
}

export function createSpread(id: string) {
  const spread = atom<AtomicSpread>({
    id,
    date: Date.now(),
    title: "",
    querent: "",
    circle: atom([]),
    rx: atom([]),
    chainPins: atom([]),
    locked: false,
    order: atom({ AllRunes: [...Futhark] }),
    readings: atom({}),
  });
  spreads.swap((spreads) => ({ ...spreads, [id]: spread }));
}

export function deleteSpread(id: string) {
  spreads.swap(({ [id]: _, ...spreads }) => spreads);
}

export const querents = atom<Array<{ label: string }>>(() => {
  return Array.from(
    new Set(Object.values(spreads.value).map((s) => s.value.querent))
  ).map((label) => ({ label }));
});

export const byChains = atom<boolean>(false);

export const currentSpreadId = atom<string | void>(() => {
  let r = route.value;
  return r.screen === Screen.EditSpread ? r.spreadId : undefined;
});

export const currentSpread = atom<AtomicSpread | void>(() => {
  const id = currentSpreadId.value;
  return id ? spreads.value[id]?.value : undefined;
});

export function updateCurrentSpread(f: (x: AtomicSpread) => AtomicSpread) {
  const id = currentSpreadId.value;
  if (!id) return;
  const spread = spreads.value[id];
  if (!spread) return;
  spread.swap(f);
}

export const currentCircle = atom(() => currentSpread.value?.circle.value);

export const currentReadings = atom(() => currentSpread.value?.readings);

export const currentRX = atom(() => currentSpread.value?.rx);

export const currentChainPins = atom(() => currentSpread.value?.chainPins);

export const currentOrder = atom(() => currentSpread.value?.order);

export const currentSpreadLocked = atom(() => !!currentSpread.value?.locked);

export const themeReading = atomFamily((theme: string, position: Rune) => {
  const t = currentReadings.value?.value[theme];
  return t && t.value[position];
});

export function setThemeReading(theme: string, position: Rune, json: any) {
  const t = currentReadings.value?.value[theme];
  if (t) {
    t.swap((theme) => ({ ...theme, [position]: json }));
  } else {
    currentReadings.value?.swap(
      (readings) =>
        ({
          ...readings,
          [theme]: atom({ [position]: json }),
        } as AtomicDescriptions)
    );
  }
}

export const themeOrder = atomFamily((theme: string) => {
  return (
    currentOrder.value?.value[theme] ||
    themes.value.find((t) => t.value.name === theme)?.value.runes ||
    []
  );
});

export function setThemeOrder(theme: string, newOrder: Rune[]) {
  currentOrder.value?.swap((order) => ({ ...order, [theme]: newOrder }));
}

export const slotByPosition = atomFamily((position: Rune) =>
  currentCircle.value?.find((s) => s.position === position)
);

export const slotByMeaning = atomFamily((meaning: Rune) =>
  currentCircle.value?.find((s) => s.meaning === meaning)
);

export function resetOrder() {
  currentOrder.value?.swap((order) => ({ ...order, AllRunes: [...Futhark] }));
}

export function straightenFreeRunes() {
  const runesInCircle = new Set(currentCircle.value?.map((s) => s.meaning));
  currentRX.value?.swap((rx) => rx.filter((rune) => runesInCircle.has(rune)));
}

export const currentChain = atom<number | void>(undefined);
export const temporaryPin = atom<Rune | void>(undefined);

export const currentChains = atom(() => {
  const result: Chain[] = [];
  const visited = new Set<Rune>();
  for (const rune of Futhark) {
    let position = rune;
    const chain = [];
    while (!visited.has(position)) {
      visited.add(position);
      const slot = slotByPosition(position).value;
      if (slot) {
        const s = deatomize(slot);
        chain.push(s);
        position = s.meaning;
      }
    }
    if (chain.length > 0) {
      result.push(chain);
    }
  }
  return result.sort((a, b) => b.length - a.length);
});

export function pinCurrentChain(newPin: Rune) {
  const chainIdx = currentChain.value;
  if (typeof chainIdx === "undefined") return;
  const spread = currentSpread.value;
  if (!spread) return;
  const allChains = currentChains.value;
  const chain = allChains[chainIdx];
  const positions = new Set(chain.map((s) => s.position));
  currentChainPins.value?.swap((chainPins) => [
    ...chainPins.filter((rune) => !positions.has(rune)),
    newPin,
  ]);
}

export const pinnedChains = atom<Chain[]>(() => {
  const chainPins = currentChainPins.value?.value;
  const allChains = currentChains.value;
  const tempPin = temporaryPin.value;
  const result = [];
  for (const slots of allChains) {
    const runes = slots.map((s) => s.position);
    const positions = new Set(runes);
    const pin =
      (tempPin && positions.has(tempPin) && tempPin) ||
      chainPins?.find((p) => positions.has(p)) ||
      runes[0];
    const offset = pin ? slots.findIndex((s) => s.position === pin) : 0;
    const pinnedChain = [];
    for (let i = offset; i < offset + slots.length; i++) {
      pinnedChain.push(slots[i % slots.length]);
    }
    result.push(pinnedChain);
  }
  return result;
});

export const runeColors = atom<Record<Rune, string>>(() => {
  const allChains = currentChains.value;
  const n = allChains.length;
  const result = {} as Record<RuneOrSum, string>;
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
  (position: Rune) => runeColors.value[position]
);

export const runeChains = atom<Record<Rune, number>>(() => {
  const allChains = currentChains.value;
  const result = {} as Record<Rune, number>;
  allChains.forEach((chain, i) => {
    for (const { position } of chain) {
      result[position as Rune] = i;
    }
  });
  return result;
});

export const isReversedByPosition = atomFamily((position: Rune) => {
  const meaning = slotByPosition(position).value?.meaning;
  const rxAtom = currentRX.value;
  const rx = rxAtom && deatomize(rxAtom);
  return !!(meaning && rx?.includes(meaning));
});

export const isReversedByMeaning = atomFamily((meaning: Rune) => {
  const rxAtom = currentRX.value;
  const rx = rxAtom && deatomize(rxAtom);
  return !!rx?.includes(meaning);
});

export function reverseRune(rune: Rune) {
  currentRX.value?.swap((rx) =>
    rx.includes(rune) ? rx.filter((x) => x !== rune) : [...rx, rune]
  );
}

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
    .filter((s) => {
      if (
        f.title !== "" &&
        !s.title.toLowerCase().includes(f.title.toLowerCase())
      )
        return false;
      if (f.fromDate !== null && s.date < f.fromDate) return false;
      if (f.toDate !== null && s.date > f.toDate) return false;
      if (
        f.querent !== "" &&
        !s.querent.toLowerCase().includes(f.querent.toLowerCase())
      )
        return false;
      if (
        f.theme &&
        !Object.values(s.readings.value[f.theme] || {}).some(
          (x) => x && JSON.stringify(x) !== emptyDoc
        )
      )
        return false;
      if (f.position && f.meaning) {
        return s.circle.value.some(
          (x) => x.position === f.position && x.meaning === f.meaning
        );
      }
      return true;
    });
});

const emptyDoc = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export const canvasSize = atom<number>(600);
export const canvasFactor = 250.0;
export const canvasCenter = [0.5 * canvasFactor, 0.5 * canvasFactor];
export const canvasScale = atom<number>(() => canvasSize.value / canvasFactor);
export const movingRune = atom<Rune | void>(undefined);
export const movingRuneCoords = atom<Point>([0, 0]);

function linearSpace(start: number, stop: number, n: number): number[] {
  return Array.from({ length: n }).map(
    (_, i) => start + (i * (stop - start)) / n
  );
}

function polarToRect(r: number, a: number, cx = 0, cy = 0): Point {
  return [r * Math.cos(a) + cx, r * Math.sin(a) + cy];
}

/** Build polygon with `n` vertices, `r` radius of described circle,
 *  center  at `cx, cy`, starting from `rot` angle. */
function polygonPoints(n: number, r: number, rot = 0, cx = 0, cy = 0): Point[] {
  return linearSpace(rot, rot + 2 * Math.PI, n).map((p) =>
    polarToRect(r, p, cx, cy)
  );
}

/** Returns coordinates of `k` vertex of polygon. */
export function polygonPoint(
  n: number,
  r: number,
  k: number,
  rot = 0,
  cx = 0,
  cy = 0
): Point {
  const a = rot + (2 * k * Math.PI) / n;
  return polarToRect(r, a, cx, cy);
}

/** Build star with given `n` vertices, `r1` inner and `r2` outer radii,
 *  center at `cx, cy`, starting from `rot` angle. */
function makeStarPoints(
  n: number,
  r1: number,
  r2: number,
  rot = 0,
  cx = 0,
  cy = 0
): Point[] {
  const p1 = polygonPoints(n, r1, rot, cx, cy);
  const p2 = polygonPoints(n, r2, rot + Math.PI / n, cx, cy);
  return p1.flatMap((x, i) => [x, p2[i]]);
}

/** Returns `[coords number]` for nearest polygon vertex for given `x, y` point.
  Polygon is described by `n, r, rot, cx, cy` */
function nearestPolygonPoint(
  n: number,
  r: number,
  [x, y]: Point,
  rot = 0,
  cx = 0,
  cy = 0
): [Point, number] {
  const phi = Math.atan2(y - cy, x - cx);
  const m1 = Math.round((phi * n) / (2 * Math.PI));
  const m2 = Math.round(((phi + rot) * n) / (2 * Math.PI));
  const a = (m1 * 2 * Math.PI) / n;
  return [polarToRect(r, a, cx, cy), (m2 < 0 ? m2 + n : m2) % n];
}

export function pointsToStr(points: Point[]): string {
  return points.map((coords) => coords.join(",")).join(" ");
}

const starOuterRadius = 100;
const starInnerRadius = 95;
const positionRuneRadius = 90;
const meaningRuneOuterRadius = 110;
const meaningRuneInnerRadius = 70;
const meaningRuneSize = 16;
// const positionRuneSize = 10;
export const middleCircleRadius = 80;
export const innerCircleRadius = 60;
export const north = -0.5 * Math.PI;

export const starPoints = pointsToStr(
  makeStarPoints(Futhark.length, starOuterRadius, starInnerRadius)
);

export const positionsStar = polygonPoints(
  Futhark.length,
  positionRuneRadius,
  north
);

export const meaningsOuterStar = polygonPoints(
  Futhark.length,
  meaningRuneOuterRadius,
  north
);

export const meaningsInnerStar = polygonPoints(
  Futhark.length,
  meaningRuneInnerRadius,
  north
);

function nearestPoint(p: Point): [Point, number] {
  return nearestPolygonPoint(Futhark.length, meaningRuneInnerRadius, p, -north);
}

function distance(p1: Point, p2: Point): number {
  const a = p1[0] - p2[0];
  const b = p1[1] - p2[1];
  return Math.sqrt(a * a + b * b);
}

export function snapMovingRune(p: Point) {
  movingRuneCoords.value = p;
  const circle = currentCircle.value;
  const meaning = movingRune.value;
  if (!circle || !meaning) return;
  const [pp, n] = nearestPoint(p);
  const isClose = distance(p, pp) < meaningRuneSize;
  if (isClose) {
    const position = Futhark[n];
    const slot = circle.find((x) => x.position === position);
    if (!slot) {
      currentSpread.value?.circle.swap((circle) => [
        ...circle.filter((x) => x.meaning !== meaning),
        { position, meaning },
      ]);
    }
  } else {
    if (circle.find((x) => x.meaning === meaning)) {
      currentSpread.value?.circle.swap((circle) =>
        circle.filter((x) => x.meaning !== meaning)
      );
    }
  }
}

export const spreadListSort = atom<GridSortModel>([
  { field: "date", sort: "desc" },
]);

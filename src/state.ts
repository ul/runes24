import { atom } from "jotai";
import { invoke } from "@tauri-apps/api/tauri";
import defaultThemes from "./themes.json";

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

export type Slot = { position: Rune; meaning: Rune };
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

// Keep it and all dependencies JSON-serializable,
// no fancy stuff like Sets etc.
export interface PersistentState {
  version: number;
  spreads: Record<string, Spread>;
  themes: ThemeScheme[];
  descriptions: Record<string, Record<Rune, any>>;
}

export enum Screen {
  SpreadsList,
  EditSpread,
}

export interface SpreadsList {
  screen: Screen.SpreadsList;
}

export interface EditSpread {
  screen: Screen.EditSpread;
  spreadId: string;
}

export type Route = SpreadsList | EditSpread;

export interface Filters {
  title: string;
  fromDate: number | null;
  toDate: number | null;
  querent: string;
  theme: string;
  position: Rune | null;
  meaning: Rune | null;
}

const initialState: PersistentState = {
  version: 1,
  spreads: {},
  themes: defaultThemes as ThemeScheme[],
  descriptions: {},
};
const persistentStateRaw = atom<PersistentState>(initialState);

persistentStateRaw.onMount = (set) => {
  (async () => {
    const initialState = JSON.parse(await invoke("get_initial_state", {}));
    if (initialState) {
      set(initialState);
    }
  })();
};

export const persistentState = atom<PersistentState, PersistentState>(
  (get) => get(persistentStateRaw),
  async (_get, set, data) => {
    set(persistentStateRaw, data);
    await invoke("set_state", { data: JSON.stringify(data) });
  }
);

export const descriptions = atom<
  Record<string, Record<Rune, any>>,
  Record<string, Record<Rune, any>>
>(
  (get) => get(persistentState).descriptions,
  (get, set, descriptions) => {
    const state = get(persistentState);
    set(persistentState, { ...state, descriptions });
  }
);

export const createSpread = atom<null, string>(null, (get, set, id) => {
  const state = get(persistentState);
  const spreads: Record<string, Spread> = {
    ...state.spreads,
    [id]: {
      id,
      date: Date.now(),
      title: "",
      querent: "",
      circle: [],
      rx: [],
      chainPins: [],
      locked: false,
      order: { AllRunes: [...Futhark] },
      readings: {},
    },
  };
  set(persistentState, { ...state, spreads });
});

export const deleteSpread = atom<null, string>(null, (get, set, id) => {
  const state = get(persistentState);
  const { [id]: _, ...spreads } = state.spreads;
  set(persistentState, { ...state, spreads });
});

export const themes = atom<ThemeScheme[], ThemeScheme[]>(
  (get) => get(persistentState).themes,
  (get, set, themes) => {
    const state = get(persistentState);
    set(persistentState, { ...state, themes });
  }
);

export const route = atom<Route>({ screen: Screen.SpreadsList });

export const querents = atom<Array<{ label: string }>>((get) => {
  const state = get(persistentState);
  return Array.from(
    new Set(Object.values(state.spreads).map((s) => s.querent))
  ).map((label) => ({ label }));
});

export const byChains = atom<boolean>(false);

export const currentSpreadId = atom<string | null>((get) => {
  let r = get(route);
  return r.screen === Screen.EditSpread ? r.spreadId : null;
});

export const currentSpread = atom<Spread | null, Spread>(
  (get) => {
    const { spreads } = get(persistentState);
    const id = get(currentSpreadId);
    return id ? spreads[id] : null;
  },
  (get, set, spread) => {
    const state = get(persistentState);
    set(persistentState, {
      ...state,
      spreads: { ...state.spreads, [spread.id]: spread },
    });
  }
);

export const resetOrder = atom<null, null>(null, (get, set) => {
  const spread = get(currentSpread);
  if (!spread) return;
  set(currentSpread, {
    ...spread,
    order: { ...spread.order, AllRunes: [...Futhark] },
  });
});

export const readings = atom<
  Record<string, Record<Rune, any>>,
  Record<string, Record<Rune, any>>
>(
  (get) => get(currentSpread)?.readings || {},
  (get, set, readings) => {
    const spread = get(currentSpread);
    if (!spread) return;
    set(currentSpread, { ...spread, readings });
  }
);

export const straightenFreeRunes = atom<null, null>(null, (get, set) => {
  const spread = get(currentSpread);
  if (!spread) return;
  const runesInCircle = new Set(spread.circle.map((s) => s.meaning));
  set(currentSpread, {
    ...spread,
    rx: spread.rx.filter((rune) => runesInCircle.has(rune)),
  });
});

export const pinCurrentChain = atom<null, Rune>(null, (get, set, newPin) => {
  const chainIdx = get(currentChain);
  if (chainIdx < 0) return;
  const spread = get(currentSpread);
  if (!spread) return;
  const allChains = get(chains);
  const chain = allChains[chainIdx];
  const positions = new Set(chain.map((s) => s.position));
  set(currentSpread, {
    ...spread,
    chainPins: [
      ...spread.chainPins.filter((rune) => !positions.has(rune)),
      newPin,
    ],
  });
});

export const chains = atom<Chain[]>((get) => {
  const result: Chain[] = [];
  const spread = get(currentSpread);
  if (!spread) return result;
  const visited = new Set<Rune>();
  for (const rune of Futhark) {
    let position = rune;
    const chain = [];
    while (!visited.has(position)) {
      visited.add(position);
      const slot = spread.circle.find((s) => s.position === position);
      if (slot) {
        chain.push(slot);
        position = slot.meaning;
      }
    }
    if (chain.length > 0) {
      result.push(chain);
    }
  }
  return result.sort((a, b) => b.length - a.length);
});

export const temporaryPin = atom<Rune | "">("");

export const pinnedChains = atom<Chain[]>((get) => {
  const spread = get(currentSpread);
  const allChains = get(chains);
  const tempPin = get(temporaryPin);
  const result = [];
  for (const slots of allChains) {
    const runes = slots.map((s) => s.position);
    const positions = new Set(runes);
    const pin =
      (tempPin !== "" && positions.has(tempPin) && tempPin) ||
      spread?.chainPins.find((p) => positions.has(p)) ||
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

export const currentChain = atom<number>(-1);

export const runeColors = atom<Record<Rune, string>>((get) => {
  const allChains = get(chains);
  const n = allChains.length;
  const result = {} as Record<Rune, string>;
  allChains.forEach((chain, i) => {
    const hue = Math.round((360 * i + 180) / n) % 360;
    const chainColor = `hsla(${hue},100%,50%,0.25)`;
    for (const { position } of chain) {
      result[position] = chainColor;
    }
  });
  return result;
});

export const runeChains = atom<Record<Rune, number>>((get) => {
  const allChains = get(chains);
  const result = {} as Record<Rune, number>;
  allChains.forEach((chain, i) => {
    for (const { position } of chain) {
      result[position] = i;
    }
  });
  return result;
});

export const reverseRune = atom<null, Rune>(null, (get, set, rune) => {
  const spread = get(currentSpread);
  if (spread) {
    if (spread.rx.includes(rune)) {
      set(currentSpread, {
        ...spread,
        rx: spread.rx.filter((x) => x !== rune),
      });
    } else {
      set(currentSpread, { ...spread, rx: [...spread.rx, rune] });
    }
  }
});

export const filters = atom<Filters>({
  title: "",
  fromDate: null,
  toDate: null,
  querent: "",
  theme: "",
  position: null,
  meaning: null,
});

const emptyDoc = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export const filteredSpreads = atom<Spread[]>((get) => {
  const { spreads } = get(persistentState);
  const f = get(filters);
  return Object.values(spreads).filter((s) => {
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
      !Object.values(s.readings[f.theme] || {}).some(
        (x) => x && JSON.stringify(x) !== emptyDoc
      )
    )
      return false;
    if (f.position && f.meaning) {
      return s.circle.some(
        (x) => x.position === f.position && x.meaning === f.meaning
      );
    }
    return true;
  });
});

export const canvasSize = atom<number>(600);
export const factor = atom<number>(250.0);
export const cx = atom<number>((get) => 0.5 * get(factor));
export const cy = atom<number>((get) => 0.5 * get(factor));
export const scale = atom<number>((get) => get(canvasSize) / get(factor));
export const movingRune = atom<Rune | "">("");
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

export const snapMovingRune = atom<null, Point>(null, (get, set, p) => {
  set(movingRuneCoords, p);
  const spread = get(currentSpread);
  const meaning = get(movingRune);
  if (!spread || meaning === "") return;
  const [pp, n] = nearestPoint(p);
  const isClose = distance(p, pp) < meaningRuneSize;
  if (isClose) {
    const position = Futhark[n];
    const slot = spread.circle.find((x) => x.position === position);
    if (!slot) {
      set(currentSpread, {
        ...spread,
        circle: [
          ...spread.circle.filter((x) => x.meaning !== meaning),
          { position, meaning },
        ],
      });
    }
  } else {
    if (spread.circle.find((x) => x.meaning === meaning)) {
      set(currentSpread, {
        ...spread,
        circle: spread.circle.filter((x) => x.meaning !== meaning),
      });
    }
  }
});

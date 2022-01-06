import debounce from "lodash/debounce";
import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { shallowEqualArrays } from "shallow-equal";
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

const saveState = debounce(
  (data) => invoke("set_state", { data: JSON.stringify(data) }),
  250
);

export const persistentState = atom<PersistentState, PersistentState>(
  (get) => get(persistentStateRaw),
  (_get, set, data) => {
    set(persistentStateRaw, data);
    saveState(data);
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

export const themeDescription = atomFamily(
  ([theme, position]: [string, RuneOrSum]) =>
    atom<any, any>(
      (get) => {
        const t = get(descriptions)[theme];
        return t && t[position as Rune];
      },
      (get, set, newDescription) => {
        const currentDescription = get(descriptions);
        const t = currentDescription[theme] || {};
        set(descriptions, {
          ...currentDescription,
          [theme]: { ...t, [position]: newDescription },
        });
      }
    ),
  shallowEqualArrays
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

export const currentSpreadId = atom<string | void>((get) => {
  let r = get(route);
  return r.screen === Screen.EditSpread ? r.spreadId : undefined;
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

export const currentCircle = atom<Chain | void>(
  (get) => get(currentSpread)?.circle
);

export const slotByPosition = atomFamily((position: RuneOrSum) =>
  atom<Slot | void>((get) =>
    position === "∑"
      ? { position: "∑", meaning: "=" }
      : get(currentCircle)?.find((s) => s.position === position)
  )
);

export const slotByMeaning = atomFamily((meaning: Rune) =>
  atom<Slot | void>((get) =>
    get(currentCircle)?.find((s) => s.meaning === meaning)
  )
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

export const themeReading = atomFamily(
  ([theme, position]: [string, RuneOrSum]) =>
    atom<any, any>(
      (get) => {
        const t = get(readings)[theme];
        return t && t[position as Rune];
      },
      (get, set, newReading) => {
        const currentReadings = get(readings);
        const t = currentReadings[theme] || {};
        set(readings, {
          ...currentReadings,
          [theme]: { ...t, [position]: newReading },
        });
      }
    ),
  shallowEqualArrays
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
  if (typeof chainIdx === "undefined") return;
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
        position = slot.meaning as Rune;
      }
    }
    if (chain.length > 0) {
      result.push(chain);
    }
  }
  return result.sort((a, b) => b.length - a.length);
});

export const temporaryPin = atom<Rune | void>(undefined);

export const pinnedChains = atom<Chain[]>((get) => {
  const spread = get(currentSpread);
  const allChains = get(chains);
  const tempPin = get(temporaryPin);
  const result = [];
  for (const slots of allChains) {
    const runes = slots.map((s) => s.position);
    const positions = new Set(runes);
    const pin =
      (tempPin && positions.has(tempPin) && tempPin) ||
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

export const currentChain = atom<number | void>(undefined);

export const runeColors = atom<Record<RuneOrSum, string>>((get) => {
  const allChains = get(chains);
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

export const runeColor = atomFamily((position: RuneOrSum) =>
  atom<string | void>((get) => get(runeColors)[position])
);

export const runeChains = atom<Record<Rune, number>>((get) => {
  const allChains = get(chains);
  const result = {} as Record<Rune, number>;
  allChains.forEach((chain, i) => {
    for (const { position } of chain) {
      result[position as Rune] = i;
    }
  });
  return result;
});

export const currentRX = atom<Rune[] | void>((get) => get(currentSpread)?.rx);

export const isReversedByPosition = atomFamily((position: RuneOrSum) =>
  atom<boolean>((get) => {
    if (position === "∑") return false;
    const meaning = get(slotByPosition(position))?.meaning;
    return !!(meaning && get(currentRX)?.includes(meaning as Rune));
  })
);

export const isReversedByMeaning = atomFamily((meaning: Rune) =>
  atom<boolean>((get) => {
    return !!get(currentRX)?.includes(meaning);
  })
);

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

export const currentOrder = atom((get) => get(currentSpread)?.order);

export const currentSpreadLocked = atom<boolean>(
  (get) => !!get(currentSpread)?.locked
);

// TODO More precise ThemeName type?
export const themeOrder = atomFamily((theme: string) =>
  atom<Rune[], Rune[]>(
    (get) => {
      const order = get(currentOrder);
      return (
        (order && order[theme]) ||
        get(themes).find((t) => t.name === theme)?.runes ||
        []
      );
    },
    (get, set, newThemeOrder) => {
      const spread = get(currentSpread);
      if (!spread) return;
      const order = {
        ...spread.order,
        [theme]: newThemeOrder,
      };
      set(currentSpread, { ...spread, order });
    }
  )
);

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
export const canvasFactor = 250.0;
export const canvasCenter = [0.5 * canvasFactor, 0.5 * canvasFactor];
export const canvasScale = atom<number>(
  (get) => get(canvasSize) / canvasFactor
);
export const movingRune = atom<Rune | undefined>(undefined);
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
  if (!spread || !meaning) return;
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

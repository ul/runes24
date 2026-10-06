// Domain types and pure helpers. No atoms or side effects here.

import dayjs from "dayjs";

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

export type Rune = (typeof Futhark)[number];

/** "∑" is the summary card of a theme; it is never placed on the circle. */
export const Sum = "∑";
export type RuneOrSum = Rune | typeof Sum;

export function isRune(x: unknown): x is Rune {
  return (Futhark as readonly unknown[]).includes(x);
}

/** A meaning rune placed onto a position of the circle. */
export type Slot = { position: Rune; meaning: Rune };

/** Slots linked position → meaning → (as position) → meaning … */
export type Chain = Slot[];

/** Name of the pseudo-theme containing all 24 runes. */
export const AllRunes = "AllRunes";

/** Tiptap/ProseMirror document JSON. */
export type Doc = { type: string; text?: string; content?: Doc[] } & Record<
  string,
  unknown
>;

/** Texts keyed by theme name, then by rune (or "∑"). */
export type ThemeTexts = Partial<Record<RuneOrSum, Doc>>;
export type Texts = Record<string, ThemeTexts>;

export interface Spread {
  id: string;
  date: number;
  title: string;
  querent: string;
  circle: Chain;
  /** Meaning runes that are reversed. */
  rx: Rune[];
  /** For every chain, the position it starts from when displayed. */
  chainPins: Rune[];
  /** Locked spreads have their circle frozen; texts stay editable. */
  locked: boolean;
  /** Custom card order per theme. */
  order: Record<string, Rune[]>;
  /** Per-spread readings. */
  readings: Texts;
}

export interface ThemeScheme {
  name: string;
  runes: Rune[];
}

export const persistentStateVersion = 1;

// Keep it and all dependencies JSON-serializable,
// no fancy stuff like Sets etc.
export interface PersistentState {
  version: number;
  spreads: Record<string, Spread>;
  /** Theme descriptions shared by all spreads. */
  descriptions: Texts;
}

export function newSpread(id: string, date = Date.now()): Spread {
  return {
    id,
    date,
    title: "",
    querent: "",
    circle: [],
    rx: [],
    chainPins: [],
    locked: false,
    order: { [AllRunes]: [...Futhark] },
    readings: {},
  };
}

function isObject(x: unknown): x is Record<string, any> {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

function runes(x: unknown): Rune[] {
  return Array.isArray(x) ? x.filter(isRune) : [];
}

function texts(x: unknown): Texts {
  return isObject(x) ? (x as Texts) : {};
}

function normalizeSpread(id: string, raw: unknown): Spread {
  const s = isObject(raw) ? raw : {};
  const base = newSpread(id, 0);
  return {
    ...base,
    id,
    date: Number.isFinite(s.date) ? s.date : base.date,
    title: typeof s.title === "string" ? s.title : "",
    querent: typeof s.querent === "string" ? s.querent : "",
    circle: Array.isArray(s.circle)
      ? s.circle.filter(
          (x: any) => isObject(x) && isRune(x.position) && isRune(x.meaning),
        )
      : [],
    rx: runes(s.rx),
    chainPins: runes(s.chainPins),
    locked: !!s.locked,
    order: isObject(s.order)
      ? Object.fromEntries(
          Object.entries(s.order).map(([k, v]) => [k, runes(v)]),
        )
      : base.order,
    readings: texts(s.readings),
  };
}

export class UnsupportedVersionError extends Error {}

/** Validate and upgrade a loaded state (parsed JSON, or the object stored in
 *  IndexedDB). Throws if it can't be understood, so the caller never
 *  overwrites data it failed to read. */
export function parsePersistentState(raw: unknown): PersistentState {
  if (!isObject(raw)) throw new Error("Saved state is not an object.");
  const version = raw.version ?? 1;
  if (version > persistentStateVersion) {
    throw new UnsupportedVersionError(
      `State file version ${version} is newer than this app supports (${persistentStateVersion}).`,
    );
  }
  const spreads = isObject(raw.spreads) ? raw.spreads : {};
  return {
    version: persistentStateVersion,
    spreads: Object.fromEntries(
      Object.entries(spreads).map(([id, s]) => [id, normalizeSpread(id, s)]),
    ),
    descriptions: texts(raw.descriptions),
  };
}

/** True if the document contains any non-whitespace text. */
export function docHasText(doc: Doc | undefined): boolean {
  if (!doc) return false;
  if (typeof doc.text === "string" && doc.text.trim() !== "") return true;
  return !!doc.content?.some(docHasText);
}

/** Split the circle into chains. Following position → meaning, each
 *  connected component is either a cycle or an open path; paths start at a
 *  position that is nobody's meaning. Sorted by length, longest first. */
export function chainsOf(circle: Chain): Chain[] {
  const byPosition = new Map(circle.map((s) => [s.position, s]));
  const meanings = new Set(circle.map((s) => s.meaning));
  const visited = new Set<Rune>();
  const result: Chain[] = [];
  const walk = (start: Rune) => {
    const chain: Chain = [];
    let slot = byPosition.get(start);
    while (slot && !visited.has(slot.position)) {
      visited.add(slot.position);
      chain.push(slot);
      slot = byPosition.get(slot.meaning);
    }
    if (chain.length > 0) result.push(chain);
  };
  // Open paths first, so they are walked from their real beginning…
  for (const rune of Futhark) {
    if (byPosition.has(rune) && !meanings.has(rune)) walk(rune);
  }
  // …then whatever is left is made of cycles.
  for (const rune of Futhark) {
    if (!visited.has(rune)) walk(rune);
  }
  // Stable sort: equal lengths keep discovery order (paths, then cycles).
  return result.sort((a, b) => b.length - a.length);
}

export function isCycle(chain: Chain): boolean {
  return (
    chain.length > 0 && chain[chain.length - 1].meaning === chain[0].position
  );
}

/** Rotate a cycle so it starts at `pin`. Paths are returned as is. */
export function pinChain(chain: Chain, pin: Rune | undefined): Chain {
  if (!pin || !isCycle(chain)) return chain;
  const offset = chain.findIndex((s) => s.position === pin);
  if (offset <= 0) return chain;
  return [...chain.slice(offset), ...chain.slice(0, offset)];
}

export interface Filters {
  title: string;
  fromDate: number | null;
  toDate: number | null;
  querent: string;
  /** Only spreads with some text in this theme's readings. */
  theme: string;
  position: Rune | null;
  meaning: Rune | null;
}

function includesText(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

export function spreadMatches(
  s: Pick<Spread, "title" | "querent" | "date" | "circle">,
  readings: (theme: string) => ThemeTexts | undefined,
  f: Filters,
): boolean {
  if (!includesText(s.title, f.title)) return false;
  if (!includesText(s.querent, f.querent)) return false;
  // Dates are whole days, both ends inclusive.
  if (
    f.fromDate !== null &&
    s.date < dayjs(f.fromDate).startOf("day").valueOf()
  )
    return false;
  if (f.toDate !== null && s.date > dayjs(f.toDate).endOf("day").valueOf())
    return false;
  if (f.theme && !Object.values(readings(f.theme) ?? {}).some(docHasText))
    return false;
  if (f.position || f.meaning) {
    return s.circle.some(
      (x) =>
        (!f.position || x.position === f.position) &&
        (!f.meaning || x.meaning === f.meaning),
    );
  }
  return true;
}

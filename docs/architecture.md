# Architecture

## Domain

| Term | Meaning |
| --- | --- |
| **Futhark** | The 24 Elder Futhark runes in their traditional order (`Futhark` in `model.ts`). |
| **Position** | One of the 24 fixed places on the circle, named after the rune drawn there in red. |
| **Meaning** | A rune placed onto a position (dark runes, dragged from the outer ring). |
| **Slot** | One `{ position, meaning }` pair. A spread's `circle` is its list of slots. |
| **Reversed (`rx`)** | Meaning runes turned upside down. Only placed runes can be reversed. |
| **Chain** | Follow position → its meaning → that rune as a position → … A chain is either a **cycle**, which comes back to where it started (always the case once all 24 runes are placed), or an open **path** while the circle is incomplete. |
| **Pin** | The position a cycle is shown from. Saved per spread in `chainPins`; clicking a rune in the chain view pins it for the moment only. |
| **Theme** | A named subset of runes to read the spread through, defined in `src/themes.json`. `AllRunes` is the built-in theme with all 24 runes. |
| **Description** | A theme's text about a rune, shared by all spreads (`PersistentState.descriptions`). |
| **Reading** | A spread's own text for a rune in a theme, plus a `∑` summary per theme (`Spread.readings`). |
| **Order** | The card order a spread uses for a theme, set by dragging cards. |
| **Lock** | Freezes the circle of a spread. Texts and order stay editable. |

Descriptions and readings are keyed by the theme's *name*, so renaming a
theme in `themes.json` orphans its texts. Rename the keys in the saved
state as well when doing that.

## Layout

```
src-tauri/src/main.rs   Rust: load and save the state file, flush on close
src/
  model.ts              domain types and pure logic: chains, filters, parsing saved state
  geometry.ts           SVG geometry of the circle
  adapton.ts            incremental computation core
  atom.ts               atoms on top of adapton + the useAtom React hook
  persistence.ts        storage backends (Tauri file / localStorage), save queue
  state.ts              app state as atoms, and the actions changing it
  *.tsx                 React components (MUI)
  model.test.mjs        unit tests for model.ts
```

`model.ts` and `geometry.ts` don't touch atoms or the outside world. Logic
that can be pure should live there, where it is easy to test.

## State: atoms

State is held in **atoms**, a small home-made take on Recoil/Reagent:

- `atom(value)` holds a value; `.value = x` / `.reset(x)` / `.swap(f)` change it.
- `atom(() => …)` is **derived**: it is computed from other atoms on first
  read and cached until one of them changes. Dependencies are recorded
  automatically while the function runs (`adapton.ts`, after
  [Adapton](http://adapton.org)).
- `atomFamily(f)` memoizes one derived atom per argument list, e.g.
  `slotByPosition(rune)`.
- `useAtom(atom)` reads an atom in a component and re-renders it when the
  value changes (`useSyncExternalStore`).

Any change schedules one notification for the next animation frame. Every
subscriber then re-reads its atom, and only those whose value changed *by
identity* re-render. So derived atoms should return the previous object when
nothing relevant changed, and actions must not mutate values in place.

`AtomicSpread` keeps a spread's often-changing parts (`circle`, `readings`, …)
in nested atoms. Typing a reading then doesn't invalidate everything that
depends on the circle. `deatomize` turns the nested structure back into plain
JSON for saving, and `atomizeSpread` does the reverse.

UI-only state (canvas size, filters, list sort, selected chain) lives in atoms
too, but is not saved.

## Persistence

1. On start `state.ts` asks `persistence.loadState()` for the saved JSON.
   `parsePersistentState` validates it, fills in fields missing from older
   files and rejects newer versions.
2. If anything fails, the app shows the `LoadError` screen and **saving is
   never started**, so an unreadable file can't be overwritten.
3. Otherwise `startSaving` watches the derived `persistentState` atom. When it
   changes (identity again), a save is debounced by 1 s. Saves are queued so
   they reach the disk in order.
4. In Rust, `set_state` writes a temporary file, syncs it, copies the old file
   to `.bak` and renames the new one into place.
5. When the window close button is pressed, Rust cancels the close and emits
   `close-requested`. The frontend flushes the pending save and calls
   `exit_app`. If that hasn't happened within 5 s, or the button is pressed
   again, Rust quits anyway.

Bump `persistentStateVersion` and extend `parsePersistentState` when the
saved format changes incompatibly.

## Security

The Tauri allowlist is empty: the webview can only call the app's own three
commands. The CSP allows only bundled scripts, styles, fonts and images.
Inline styles are allowed because Emotion (MUI) injects them.

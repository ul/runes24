# Runes Circle

A desktop app for laying out and journaling Elder Futhark rune spreads on a
24-position circle. Built with [Tauri 1](https://tauri.app) (Rust) and React.

For each spread you place the 24 runes onto the 24 positions of the circle,
optionally reverse some of them, and write readings: per rune, per theme
(Деятельность, Отношения, …), and a summary per theme. See
[docs/architecture.md](docs/architecture.md) for the domain model and how the
code is put together.

## Using it

- **+** in the top bar creates a spread; the list icon goes back to all spreads.
- Drag a rune from the outer ring onto a position to place it; drag it away
  to remove it. Double-click a placed rune to reverse it.
- The lock switch freezes the circle (placement and reversals). Texts stay
  editable.
- Below the circle, **All Runes** shows a card per position. Each card has the
  rune's shared theme description (same in every spread) and this spread's
  reading. Turn on **Chains** to group the cards by chain, or click a rune to
  open its chain.
- Rich text: select text for bold, italic, underline and colours.

## Your data

Everything is saved to `~/.runes24/state.json.snap` (JSON, compressed with
[Snappy framing](https://github.com/google/snappy/blob/main/framing_format.txt)),
about a second after each change and again when the window closes.

- Saves go to a temporary file first, which then replaces the old one, so a
  crash can't leave a half-written file.
- Before each save the previous file is copied to `state.json.snap.bak`.
- If the file can't be read, the app shows an error and doesn't touch the
  file. If a save fails, a red banner appears with a **Retry** button.

To back up, copy `~/.runes24`. To read the data outside the app, decompress it
with any Snappy tool, e.g. `snzip -d -t framing2`.

## Development

Prerequisites: [Node](https://nodejs.org) ≥ 23.6 with Yarn 1, a Rust
toolchain, and the [Tauri 1 system
dependencies](https://v1.tauri.app/v1/guides/getting-started/prerequisites).

```bash
yarn install
```

```bash
yarn dev
```

`yarn dev` starts the Parcel dev server and the app window.

| Command | What it does |
| --- | --- |
| `yarn dev` | Run the desktop app with hot reload. |
| `yarn start` | Run only the web UI at http://localhost:1234. Data then goes to the browser's `localStorage` instead of `~/.runes24`. |
| `yarn bundle` | Build the release app and installers into `src-tauri/target/release/bundle`. |
| `yarn verify` | Type-check, run the tests, check formatting. CI runs the same, plus `cargo fmt --check` and `cargo clippy`. |
| `yarn test` | Unit tests for the domain logic (Node's test runner). |
| `yarn format` | Format the frontend with Prettier. |

## License

[MIT](LICENSE)

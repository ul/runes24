// Run with `yarn test` (Node's test runner; Node ≥ 23.6 strips TS types).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chainsOf,
  docHasText,
  isCycle,
  newSpread,
  parsePersistentState,
  pinChain,
  spreadMatches,
  UnsupportedVersionError,
} from "./model.ts";

const [F, U, TH, A, R, K] = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ"];
const slot = (position, meaning) => ({ position, meaning });
const positions = (chain) => chain.map((s) => s.position);

test("an open path is one chain, walked from its start", () => {
  // ᚨ → ᚠ → ᚢ: ᚠ comes first in Futhark order but is not the start.
  const chains = chainsOf([slot(F, U), slot(A, F)]);
  assert.deepEqual(chains.map(positions), [[A, F]]);
  assert.equal(isCycle(chains[0]), false);
});

test("cycles, self-loops and paths are separated and sorted by length", () => {
  const chains = chainsOf([
    slot(F, U),
    slot(U, TH),
    slot(TH, F),
    slot(A, A),
    slot(R, K),
  ]);
  assert.deepEqual(chains.map(positions), [[F, U, TH], [R], [A]]);
  assert.deepEqual(chains.map(isCycle), [true, false, true]);
});

test("pinChain rotates cycles only", () => {
  const cycle = [slot(F, U), slot(U, TH), slot(TH, F)];
  assert.deepEqual(positions(pinChain(cycle, TH)), [TH, F, U]);
  assert.deepEqual(positions(pinChain(cycle, undefined)), [F, U, TH]);
  const path = [slot(A, F), slot(F, U)];
  assert.deepEqual(positions(pinChain(path, F)), [A, F]);
});

test("docHasText ignores empty and whitespace-only documents", () => {
  const p = (...content) => ({ type: "paragraph", content });
  assert.equal(docHasText(undefined), false);
  assert.equal(docHasText({ type: "doc", content: [p(), p()] }), false);
  assert.equal(
    docHasText({ type: "doc", content: [p({ type: "text", text: "  " })] }),
    false,
  );
  assert.equal(
    docHasText({ type: "doc", content: [p(), p({ type: "text", text: "x" })] }),
    true,
  );
});

const noFilters = {
  title: "",
  fromDate: null,
  toDate: null,
  querent: "",
  theme: "",
  position: null,
  meaning: null,
};

test("position and meaning filters work on their own and together", () => {
  const s = { ...newSpread("x"), circle: [slot(F, U)] };
  const m = (f) => spreadMatches(s, () => undefined, { ...noFilters, ...f });
  assert.equal(m({ position: F }), true);
  assert.equal(m({ position: U }), false);
  assert.equal(m({ meaning: U }), true);
  assert.equal(m({ meaning: F }), false);
  assert.equal(m({ position: F, meaning: U }), true);
  assert.equal(m({ position: F, meaning: TH }), false);
});

test("date filters include whole days at both ends", () => {
  const day = new Date(2024, 4, 10).valueOf();
  const s = { ...newSpread("x"), date: day + 15 * 3600 * 1000 };
  const m = (f) => spreadMatches(s, () => undefined, { ...noFilters, ...f });
  assert.equal(m({ fromDate: day + 20 * 3600 * 1000 }), true);
  assert.equal(m({ toDate: day }), true);
  assert.equal(m({ toDate: day - 1 }), false);
});

test("parsePersistentState fills missing fields and drops junk", () => {
  const state = parsePersistentState(
    structuredClone({
      version: 1,
      spreads: {
        a: { title: "t", circle: [slot(F, U), { position: "x" }], rx: [U, 1] },
      },
    }),
  );
  const a = state.spreads.a;
  assert.equal(a.id, "a");
  assert.equal(a.title, "t");
  assert.deepEqual(a.circle, [slot(F, U)]);
  assert.deepEqual(a.rx, [U]);
  assert.deepEqual(a.readings, {});
  assert.deepEqual(state.descriptions, {});
});

test("parsePersistentState refuses what it can't understand", () => {
  assert.throws(() => parsePersistentState(null));
  assert.throws(() => parsePersistentState([]));
  assert.throws(
    () => parsePersistentState({ version: 2 }),
    UnsupportedVersionError,
  );
});

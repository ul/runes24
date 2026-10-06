// Loading and saving `PersistentState`.
//
// The desktop app (Tauri) keeps it in `~/.runes24/state.json.snap` (see
// `src-tauri/src/main.rs`). The web version, and `yarn start`, keep it in the
// browser's IndexedDB under the key "runes24" of idb-keyval's default store,
// the same place the web version has always used.

import debounce from "lodash/debounce";
import { get, set } from "idb-keyval";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { atom, Atom, globalSubscriptions } from "./atom";
import { PersistentState } from "./model";

interface Backend {
  /** Resolves to `undefined` when nothing has been saved yet; rejects on
   *  errors. The result still has to be validated. */
  load(): Promise<unknown>;
  save(state: PersistentState): Promise<void>;
  /** True if the storage itself applies writes in the order `save` is
   *  called, so a write can start before the previous one finishes. */
  ordered: boolean;
  /** `beforeExit` should save pending changes. */
  onExit(beforeExit: () => Promise<void>): void;
}

const tauriBackend: Backend = {
  async load() {
    const json = await invoke<string | null>("get_initial_state");
    return json === null ? undefined : JSON.parse(json);
  },
  save: (state) => invoke<void>("set_state", { data: JSON.stringify(state) }),
  // Async commands run on a thread pool, so they could overtake each other.
  ordered: false,
  onExit(beforeExit) {
    // Rust waits for `exit_app` (or a timeout) before quitting.
    listen("close-requested", async () => {
      try {
        await beforeExit();
      } finally {
        await invoke("exit_app");
      }
    });
  },
};

const idbKey = "runes24";

const browserBackend: Backend = {
  load: () => get(idbKey),
  save: (state) => set(idbKey, state),
  // IndexedDB runs overlapping write transactions in creation order. Starting
  // the write at once matters on page exit: one queued behind a pending
  // write might never start.
  ordered: true,
  onExit(beforeExit) {
    // Browsers don't wait for async work on unload, so save as soon as the
    // page is hidden (tab switch, app switch on phones, closing), which is
    // the last reliable moment.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") void beforeExit();
    });
    window.addEventListener("pagehide", () => void beforeExit());
  },
};

const backend: Backend = isTauri() ? tauriBackend : browserBackend;

/** Last save failure, shown to the user until a save succeeds. */
export const saveError = atom<string | null>(null);

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function loadState(): Promise<unknown> {
  return backend.load();
}

/** Start saving `snapshot` whenever it changes. Call only after the stored
 *  state has been loaded successfully, so a failed load never overwrites it. */
export function startSaving(snapshot: Atom<PersistentState>) {
  /** Last state known to be on disk. */
  let lastSaved = snapshot.value;
  /** Last state handed to the save queue; reset when a save fails so the
   *  same state is tried again. */
  let lastQueued: PersistentState | undefined = lastSaved;
  let queue: Promise<void> = Promise.resolve();

  const write = (): Promise<void> => {
    const state = snapshot.value;
    if (state === lastQueued) return queue;
    lastQueued = state;
    // Writes must reach the storage in order; results are handled in order.
    const saving = backend.ordered
      ? backend.save(state)
      : queue.then(() => backend.save(state));
    // Its failure is reported below, once the queue gets to it.
    saving.catch(() => {});
    queue = queue
      .then(() => saving)
      .then(
        () => {
          lastSaved = state;
          if (saveError.value !== null) saveError.value = null;
        },
        (e) => {
          console.error("Saving failed", e);
          if (lastQueued === state) lastQueued = undefined;
          saveError.value = errorMessage(e);
        },
      );
    return queue;
  };

  const scheduleWrite = debounce(write, 1000);

  // Fires on every atom change, so ignore the ones not touching the state.
  // After a failure this keeps retrying about once a second.
  globalSubscriptions.subscribe(() => {
    if (snapshot.value !== lastQueued) scheduleWrite();
  });

  return {
    /** Save now; also picks up edits made while an earlier save was running. */
    async flush(): Promise<void> {
      scheduleWrite.cancel();
      for (let i = 0; i < 3 && snapshot.value !== lastSaved; i++) {
        await write();
      }
    },
    retry(): Promise<void> {
      scheduleWrite.cancel();
      lastQueued = undefined;
      return write();
    },
  };
}

export function onExit(beforeExit: () => Promise<void>) {
  backend.onExit(beforeExit);
}

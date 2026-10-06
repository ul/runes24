// Loading and saving `PersistentState`.
//
// Inside Tauri the state lives in `~/.runes24/state.json.snap` (see
// `src-tauri/src/main.rs`); in a plain browser (handy for UI development with
// `yarn start`) it falls back to `localStorage`.

import debounce from "lodash/debounce";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { atom, Atom, globalSubscriptions } from "./atom";
import { PersistentState } from "./model";

interface Backend {
  /** Resolves to `null` when nothing has been saved yet; rejects on errors. */
  load(): Promise<string | null>;
  save(data: string): Promise<void>;
  /** `beforeExit` is awaited before the app quits. */
  onExit(beforeExit: () => Promise<void>): void;
}

const tauriBackend: Backend = {
  load: () => invoke<string | null>("get_initial_state"),
  save: (data) => invoke<void>("set_state", { data }),
  onExit(beforeExit) {
    listen("close-requested", async () => {
      try {
        await beforeExit();
      } finally {
        await invoke("exit_app");
      }
    });
  },
};

const localStorageKey = "runes24-state";

const browserBackend: Backend = {
  load: async () => localStorage.getItem(localStorageKey),
  save: async (data) => localStorage.setItem(localStorageKey, data),
  onExit(beforeExit) {
    window.addEventListener("beforeunload", () => void beforeExit());
  },
};

const backend: Backend =
  "__TAURI_IPC__" in window ? tauriBackend : browserBackend;

/** Last save failure, shown to the user until a save succeeds. */
export const saveError = atom<string | null>(null);

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function loadState(): Promise<string | null> {
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
    const data = JSON.stringify(state);
    // Chained, so writes reach the disk in order.
    queue = queue
      .then(() => backend.save(data))
      .then(
        () => {
          lastSaved = state;
          if (saveError.value !== null) saveError.value = null;
        },
        (e) => {
          console.error("Saving failed", e);
          if (lastQueued === state) lastQueued = undefined;
          saveError.value = errorMessage(e);
        }
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

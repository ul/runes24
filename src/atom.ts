import memoize from "moize";
import { useEffect, useMemo, useState } from "react";
import { Adapton, AdaptonRef, Thunk } from "./adapton";

class Subscriptions {
  private listeners: Set<() => void> = new Set();
  private isNotificationScheduled = false;

  subscribe(f: () => void): () => void {
    this.listeners.add(f);
    return () => this.unsubscribe(f);
  }

  unsubscribe(f: () => void): void {
    this.listeners.delete(f);
  }

  notify(): void {
    if (this.isNotificationScheduled) return;
    this.isNotificationScheduled = true;
    requestAnimationFrame(() => {
      this.isNotificationScheduled = false;
      for (const f of this.listeners) {
        f();
      }
    });
  }
}

export const globalSubscriptions = new Subscriptions();

export class Atom<T> {
  private adapton: Adapton<T>;

  constructor(thunk: Thunk<T>);
  constructor(value: T);
  constructor(thunkOrValue: Thunk<T> | T) {
    if (typeof thunkOrValue === "function") {
      this.adapton = new Adapton(thunkOrValue as Thunk<T>);
    } else {
      this.adapton = new AdaptonRef(thunkOrValue as T);
    }
  }

  deref(): T {
    return this.adapton.force();
  }

  reset(value: T) {
    if (!(this.adapton instanceof AdaptonRef)) {
      throw new Error("Atom was created with a thunk, can't set value.");
    }
    this.adapton.set(value);
    globalSubscriptions.notify();
  }

  swap(f: (oldValue: T) => T) {
    this.reset(f(this.deref()));
  }

  get value(): T {
    return this.deref();
  }

  set value(x: T) {
    this.reset(x);
  }
}

export function atom<T>(thunk: Thunk<T>): Atom<T>;
export function atom<T>(value: T): Atom<T>;
export function atom<T>(thunkOrValue: Thunk<T> | T): Atom<T> {
  return new Atom(thunkOrValue) as Atom<T>;
}

export function atomFamily<A extends any[], T>(
  f: (...args: A) => T
): (...args: A) => Atom<T> {
  return memoize((...args: A) => atom(() => f(...args)), { maxSize: 0x1000 });
}

export function deatomize(object: any): any {
  if (object instanceof Atom) {
    return deatomize(object.deref());
  }
  if (Array.isArray(object)) {
    return object.map((x) => deatomize(x));
  } else if (object !== null && typeof object === "object") {
    const result: { [k: string]: any } = {};
    for (const [k, v] of Object.entries(object)) {
      result[k] = deatomize(v);
    }
    return result;
  } else {
    return object;
  }
}

export function useAtom<T>(atom: Atom<T>): T {
  // `useState` is leveraged to trigger component re-render by calling `setValue`
  // with the new atom result.
  const [value, setValue] = useState(() => atom.deref());
  // `useMemo` is called during render top-down which helps to maintain the desired
  // order of insertion in `subscriptions`.
  const unsubscribe = useMemo(() => {
    let previous = value;
    const update = () => {
      const value = atom.deref();
      if (value !== previous) {
        previous = value;
        setValue(value);
      }
    };
    return globalSubscriptions.subscribe(update);
  }, [atom]);
  // Clean up subscription.
  useEffect(() => unsubscribe, [unsubscribe]);
  return value;
}

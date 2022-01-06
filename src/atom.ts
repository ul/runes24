import memoize from "moize";
import { useEffect, useMemo, useState } from "react";
import { Adapton, AdaptonRef, force, Thunk } from "./adapton";

const globalSubscriptions: Set<() => void> = new Set();

export function subscribe(f: () => void, subscriptions = globalSubscriptions) {
  subscriptions.add(f);
  return () => {
    subscriptions.delete(f);
  };
}

export class Atom<T> {
  private adapton: Adapton<T>;

  constructor(adapton: Adapton<T>) {
    this.adapton = adapton;
  }

  deref(): T {
    return force(this.adapton);
  }

  reset(value: T) {
    if (!(this.adapton instanceof AdaptonRef)) {
      throw new Error("Atom was created with a thunk, can't set value.");
    }
    this.adapton.set(value);
    requestAnimationFrame(() => {
      for (const f of globalSubscriptions) {
        f();
      }
    });
  }

  swap(f: (oldValue: T) => T) {
    this.reset(f(this.deref()));
  }
}

export function atom<T>(thunk: Thunk<T>): Atom<T>;
export function atom<T>(value: T): Atom<T>;
export function atom<T>(thunkOrValue: Thunk<T> | T): Atom<T> {
  if (typeof thunkOrValue === "function") {
    return new Atom(new Adapton(thunkOrValue as Thunk<T>));
  } else {
    return new Atom(new AdaptonRef(thunkOrValue as T));
  }
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
    let prevValue = value;
    return subscribe(() => {
      const newValue = atom.deref();
      if (newValue !== prevValue) {
        prevValue = newValue;
        setValue(newValue);
      }
    });
  }, [atom]);
  // Clean up subscription.
  useEffect(() => unsubscribe, [unsubscribe]);
  return value;
}

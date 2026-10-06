export type Thunk<T> = () => T;

/** The node whose thunk is running; nodes it forces become its dependencies. */
let currentlyAdapting: Adapton<any> | undefined;

export class Adapton<T> {
  // This is okay as we never use initial value due to `isClean = false`
  protected result: T = undefined as unknown as T;
  protected isClean: boolean = false;

  private thunk: Thunk<T>;
  private sub: Set<Adapton<any>> = new Set();
  private sup: Set<Adapton<any>> = new Set();

  constructor(thunk: Thunk<T>) {
    this.thunk = thunk;
  }

  addDependency<U>(sub: Adapton<U>) {
    this.sub.add(sub);
    sub.sup.add(this);
  }

  removeDependency<U>(sub: Adapton<U>) {
    this.sub.delete(sub);
    sub.sup.delete(this);
  }

  compute(): T {
    if (this.isClean) return this.result;
    for (const sub of this.sub) {
      this.removeDependency(sub);
    }
    this.isClean = true;
    try {
      this.result = this.thunk();
    } catch (e) {
      this.isClean = false;
      throw e;
    }
    // A dependency may have been changed while the thunk was running.
    return this.compute();
  }

  dirty() {
    if (!this.isClean) return;
    this.isClean = false;
    for (const sup of this.sup) {
      sup.dirty();
    }
  }

  force(): T {
    const prevAdapting = currentlyAdapting;
    currentlyAdapting = this;
    let result: T;
    try {
      result = this.compute();
    } finally {
      currentlyAdapting = prevAdapting;
    }
    currentlyAdapting?.addDependency(this);
    return result;
  }
}

export class AdaptonRef<T> extends Adapton<T> {
  constructor(value: T) {
    super(() => this.result);
    this.result = value;
    this.isClean = true;
  }

  set(value: T) {
    this.result = value;
    this.dirty();
  }
}

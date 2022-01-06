export type Thunk<T> = () => T;

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
    this.result = this.thunk();
    return this.compute();
  }

  dirty() {
    if (!this.isClean) return;
    this.isClean = false;
    for (const sup of this.sup) {
      sup.dirty();
    }
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

let currentlyAdapting: Adapton<any>;

export function force<T>(adapton: Adapton<T>): T {
  const prevAdapting = currentlyAdapting;
  currentlyAdapting = adapton;
  const result = adapton.compute();
  currentlyAdapting = prevAdapting;
  currentlyAdapting?.addDependency(adapton);
  return result;
}

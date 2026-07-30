/**
 * A tiny in-memory stand-in for the slice of Firestore this app uses.
 *
 * It exists so the demo build can run with no Firebase project behind it. The
 * app code in src/firebase/* is untouched and still speaks the compat API
 * (collection/doc/where/orderBy/limit/onSnapshot/batch); only the object it
 * talks to changes. Data lives for the lifetime of the tab.
 *
 * Deliberately not supported (unused here): dotted field paths, transactions,
 * cursors, collection groups, and every query operator except '==' and
 * 'array-contains'.
 */

type DocData = Record<string, any>;
type Direction = 'asc' | 'desc';

/* -------------------------------------------------------------------------- */
/* Timestamp                                                                  */
/* -------------------------------------------------------------------------- */

export class DemoTimestamp {
  constructor(readonly seconds: number, readonly nanoseconds: number) {}

  static now(): DemoTimestamp {
    return DemoTimestamp.fromMillis(Date.now());
  }

  static fromMillis(millis: number): DemoTimestamp {
    return new DemoTimestamp(Math.floor(millis / 1000), (millis % 1000) * 1e6);
  }

  static fromDate(date: Date): DemoTimestamp {
    return DemoTimestamp.fromMillis(date.getTime());
  }

  toMillis(): number {
    return this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6);
  }

  toDate(): Date {
    return new Date(this.toMillis());
  }

  isEqual(other: unknown): boolean {
    return other instanceof DemoTimestamp && other.toMillis() === this.toMillis();
  }
}

/* -------------------------------------------------------------------------- */
/* FieldValue sentinels                                                       */
/* -------------------------------------------------------------------------- */

type SentinelKind = 'serverTimestamp' | 'arrayUnion' | 'arrayRemove' | 'delete';

class Sentinel {
  constructor(readonly kind: SentinelKind, readonly elements: any[] = []) {}
}

export const DemoFieldValue = {
  serverTimestamp: () => new Sentinel('serverTimestamp'),
  arrayUnion: (...elements: any[]) => new Sentinel('arrayUnion', elements),
  arrayRemove: (...elements: any[]) => new Sentinel('arrayRemove', elements),
  delete: () => new Sentinel('delete'),
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function autoId(): string {
  let id = '';
  for (let i = 0; i < 20; i += 1) {
    id += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
  }
  return id;
}

/** Structural copy that preserves Timestamps and binary values by reference. */
function clone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof DemoTimestamp) return value;
  if (value instanceof Date) return new Date(value.getTime()) as unknown as T;
  if (typeof File !== 'undefined' && value instanceof File) return value;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value;
  if (Array.isArray(value)) return value.map(clone) as unknown as T;

  const out: DocData = {};
  Object.entries(value as DocData).forEach(([k, v]) => {
    out[k] = clone(v);
  });
  return out as T;
}

function sameValue(a: any, b: any): boolean {
  if (a instanceof DemoTimestamp && b instanceof DemoTimestamp) return a.isEqual(b);
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === 'object') return JSON.stringify(a) === JSON.stringify(b);
  return false;
}

/** Resolves FieldValue sentinels against the document's existing state. */
function applyWrite(existing: DocData | undefined, incoming: DocData): DocData {
  const base: DocData = existing ? clone(existing) : {};

  Object.entries(incoming).forEach(([key, value]) => {
    if (!(value instanceof Sentinel)) {
      base[key] = clone(value);
      return;
    }

    switch (value.kind) {
      case 'serverTimestamp':
        base[key] = DemoTimestamp.now();
        break;
      case 'arrayUnion': {
        const current: any[] = Array.isArray(base[key]) ? base[key] : [];
        const additions = value.elements.filter(
          (el) => !current.some((existingEl) => sameValue(existingEl, el))
        );
        base[key] = [...current, ...additions];
        break;
      }
      case 'arrayRemove': {
        const current: any[] = Array.isArray(base[key]) ? base[key] : [];
        base[key] = current.filter(
          (existingEl) => !value.elements.some((el) => sameValue(existingEl, el))
        );
        break;
      }
      case 'delete':
        delete base[key];
        break;
    }
  });

  return base;
}

function compare(a: any, b: any): number {
  const av = a instanceof DemoTimestamp ? a.toMillis() : a;
  const bv = b instanceof DemoTimestamp ? b.toMillis() : b;

  if (av === undefined || av === null) return bv === undefined || bv === null ? 0 : -1;
  if (bv === undefined || bv === null) return 1;
  if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv);
  if (av < bv) return -1;
  if (av > bv) return 1;
  return 0;
}

const parentPath = (docPath: string) => docPath.split('/').slice(0, -1).join('/');

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

type Watcher = { collectionPath: string | null; docPath: string | null; fire: () => void };

class Store {
  private docs = new Map<string, DocData>();
  private watchers = new Set<Watcher>();
  private pending = false;
  private dirtyCollections = new Set<string>();
  private dirtyDocs = new Set<string>();

  read(path: string): DocData | undefined {
    return this.docs.get(path);
  }

  list(collectionPath: string): Array<{ id: string; data: DocData }> {
    const out: Array<{ id: string; data: DocData }> = [];
    this.docs.forEach((data, path) => {
      if (parentPath(path) === collectionPath) {
        out.push({ id: path.split('/').pop() as string, data });
      }
    });
    return out;
  }

  write(path: string, data: DocData, merge: boolean): void {
    const existing = merge ? this.docs.get(path) : undefined;
    this.docs.set(path, applyWrite(existing, data));
    this.markDirty(path);
  }

  update(path: string, data: DocData): void {
    // Firestore rejects updates to missing docs; the app never relies on that,
    // so treat it as an upsert rather than throwing mid-demo.
    this.docs.set(path, applyWrite(this.docs.get(path), data));
    this.markDirty(path);
  }

  remove(path: string): void {
    this.docs.delete(path);
    // Firestore keeps subcollections of a deleted doc; here nothing reads them
    // afterwards, so drop them to avoid orphans lingering in the demo.
    Array.from(this.docs.keys())
      .filter((key) => key.startsWith(`${path}/`))
      .forEach((key) => this.docs.delete(key));
    this.markDirty(path);
  }

  watch(watcher: Watcher): () => void {
    this.watchers.add(watcher);
    return () => {
      this.watchers.delete(watcher);
    };
  }

  private markDirty(docPath: string): void {
    this.dirtyDocs.add(docPath);
    this.dirtyCollections.add(parentPath(docPath));
    this.scheduleFlush();
  }

  /**
   * Batch notifications into a microtask so a burst of writes produces one
   * render pass, and so listeners never fire synchronously inside a write.
   */
  private scheduleFlush(): void {
    if (this.pending) return;
    this.pending = true;

    Promise.resolve().then(() => {
      this.pending = false;
      const collections = this.dirtyCollections;
      const docs = this.dirtyDocs;
      this.dirtyCollections = new Set();
      this.dirtyDocs = new Set();

      Array.from(this.watchers).forEach((watcher) => {
        const hit =
          (watcher.collectionPath !== null && collections.has(watcher.collectionPath)) ||
          (watcher.docPath !== null && docs.has(watcher.docPath));
        if (hit) watcher.fire();
      });
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Snapshots                                                                  */
/* -------------------------------------------------------------------------- */

class DemoDocumentSnapshot {
  constructor(
    readonly id: string,
    private readonly raw: DocData | undefined,
    readonly ref: DemoDocumentReference
  ) {}

  get exists(): boolean {
    return this.raw !== undefined;
  }

  data(): DocData | undefined {
    return this.raw === undefined ? undefined : clone(this.raw);
  }
}

type DocChange = { type: 'added' | 'modified' | 'removed'; doc: DemoDocumentSnapshot };

class DemoQuerySnapshot {
  constructor(readonly docs: DemoDocumentSnapshot[], private readonly changes: DocChange[]) {}

  get empty(): boolean {
    return this.docs.length === 0;
  }

  get size(): number {
    return this.docs.length;
  }

  forEach(callback: (doc: DemoDocumentSnapshot) => void): void {
    this.docs.forEach(callback);
  }

  docChanges(): DocChange[] {
    return this.changes;
  }
}

/* -------------------------------------------------------------------------- */
/* Query                                                                      */
/* -------------------------------------------------------------------------- */

type Filter = { field: string; op: '==' | 'array-contains'; value: any };
type Order = { field: string; direction: Direction };

class DemoQuery {
  constructor(
    protected readonly store: Store,
    readonly path: string,
    protected readonly filters: Filter[] = [],
    protected readonly orders: Order[] = [],
    protected readonly limitCount: number | null = null
  ) {}

  where(field: string, op: Filter['op'], value: any): DemoQuery {
    return new DemoQuery(
      this.store,
      this.path,
      [...this.filters, { field, op, value }],
      this.orders,
      this.limitCount
    );
  }

  orderBy(field: string, direction: Direction = 'asc'): DemoQuery {
    return new DemoQuery(
      this.store,
      this.path,
      this.filters,
      [...this.orders, { field, direction }],
      this.limitCount
    );
  }

  limit(count: number): DemoQuery {
    return new DemoQuery(this.store, this.path, this.filters, this.orders, count);
  }

  protected evaluate(): DemoDocumentSnapshot[] {
    let rows = this.store.list(this.path);

    rows = rows.filter(({ data }) =>
      this.filters.every(({ field, op, value }) => {
        const actual = data[field];
        if (op === '==') return sameValue(actual, value);
        return Array.isArray(actual) && actual.some((el) => sameValue(el, value));
      })
    );

    this.orders
      .slice()
      .reverse()
      .forEach(({ field, direction }) => {
        rows.sort((a, b) => {
          const result = compare(a.data[field], b.data[field]);
          return direction === 'desc' ? -result : result;
        });
      });

    if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);

    return rows.map(
      ({ id, data }) =>
        new DemoDocumentSnapshot(id, data, new DemoDocumentReference(this.store, `${this.path}/${id}`))
    );
  }

  async get(): Promise<DemoQuerySnapshot> {
    const docs = this.evaluate();
    return new DemoQuerySnapshot(
      docs,
      docs.map((doc) => ({ type: 'added' as const, doc }))
    );
  }

  onSnapshot(
    onNext: (snapshot: DemoQuerySnapshot) => void,
    onError?: (error: Error) => void
  ): () => void {
    let previous = new Map<string, DocData | undefined>();

    const emit = () => {
      try {
        const docs = this.evaluate();
        const current = new Map<string, DocData | undefined>();
        const changes: DocChange[] = [];

        docs.forEach((doc) => {
          const data = doc.data();
          current.set(doc.id, data);
          if (!previous.has(doc.id)) {
            changes.push({ type: 'added', doc });
          } else if (!sameValue(previous.get(doc.id), data)) {
            changes.push({ type: 'modified', doc });
          }
        });

        previous.forEach((data, id) => {
          if (!current.has(id)) {
            changes.push({
              type: 'removed',
              doc: new DemoDocumentSnapshot(
                id,
                data,
                new DemoDocumentReference(this.store, `${this.path}/${id}`)
              ),
            });
          }
        });

        previous = current;
        onNext(new DemoQuerySnapshot(docs, changes));
      } catch (error) {
        if (onError) onError(error as Error);
        else throw error;
      }
    };

    const unwatch = this.store.watch({ collectionPath: this.path, docPath: null, fire: emit });
    emit(); // Firestore delivers an initial snapshot immediately
    return unwatch;
  }
}

/* -------------------------------------------------------------------------- */
/* References                                                                 */
/* -------------------------------------------------------------------------- */

class DemoCollectionReference extends DemoQuery {
  get id(): string {
    return this.path.split('/').pop() as string;
  }

  doc(id?: string): DemoDocumentReference {
    return new DemoDocumentReference(this.store, `${this.path}/${id ?? autoId()}`);
  }

  async add(data: DocData): Promise<DemoDocumentReference> {
    const ref = this.doc();
    await ref.set(data);
    return ref;
  }
}

class DemoDocumentReference {
  constructor(private readonly store: Store, readonly path: string) {}

  get id(): string {
    return this.path.split('/').pop() as string;
  }

  collection(name: string): DemoCollectionReference {
    return new DemoCollectionReference(this.store, `${this.path}/${name}`);
  }

  async get(): Promise<DemoDocumentSnapshot> {
    return new DemoDocumentSnapshot(this.id, this.store.read(this.path), this);
  }

  async set(data: DocData, options?: { merge?: boolean }): Promise<void> {
    this.store.write(this.path, data, options?.merge === true);
  }

  async update(data: DocData): Promise<void> {
    this.store.update(this.path, data);
  }

  async delete(): Promise<void> {
    this.store.remove(this.path);
  }

  onSnapshot(
    onNext: (snapshot: DemoDocumentSnapshot) => void,
    onError?: (error: Error) => void
  ): () => void {
    const emit = () => {
      try {
        onNext(new DemoDocumentSnapshot(this.id, this.store.read(this.path), this));
      } catch (error) {
        if (onError) onError(error as Error);
        else throw error;
      }
    };

    const unwatch = this.store.watch({ collectionPath: null, docPath: this.path, fire: emit });
    emit();
    return unwatch;
  }
}

/* -------------------------------------------------------------------------- */
/* Firestore instance                                                         */
/* -------------------------------------------------------------------------- */

type BatchOp =
  | { kind: 'set'; ref: DemoDocumentReference; data: DocData; merge: boolean }
  | { kind: 'update'; ref: DemoDocumentReference; data: DocData }
  | { kind: 'delete'; ref: DemoDocumentReference };

export class DemoFirestore {
  readonly store = new Store();

  collection(path: string): DemoCollectionReference {
    return new DemoCollectionReference(this.store, path);
  }

  doc(path: string): DemoDocumentReference {
    return new DemoDocumentReference(this.store, path);
  }

  batch() {
    const ops: BatchOp[] = [];
    return {
      set: (ref: DemoDocumentReference, data: DocData, options?: { merge?: boolean }) => {
        ops.push({ kind: 'set', ref, data, merge: options?.merge === true });
      },
      update: (ref: DemoDocumentReference, data: DocData) => {
        ops.push({ kind: 'update', ref, data });
      },
      delete: (ref: DemoDocumentReference) => {
        ops.push({ kind: 'delete', ref });
      },
      commit: async () => {
        ops.forEach((op) => {
          if (op.kind === 'set') this.store.write(op.ref.path, op.data, op.merge);
          else if (op.kind === 'update') this.store.update(op.ref.path, op.data);
          else this.store.remove(op.ref.path);
        });
      },
    };
  }

  /** Seeding helper - writes without going through the public async API. */
  seed(path: string, data: DocData): void {
    this.store.write(path, data, false);
  }
}

export { DemoCollectionReference, DemoDocumentReference, DemoDocumentSnapshot, DemoQuerySnapshot };

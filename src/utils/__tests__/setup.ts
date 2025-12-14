import { afterEach } from "vitest";

// In-memory storage for our mock IndexedDB
const databases = new Map<string, Map<string, Map<string, unknown>>>();

// Helper to get or create database storage
function getDatabase(dbName: string) {
  if (!databases.has(dbName)) {
    databases.set(dbName, new Map());
  }
  return databases.get(dbName)!;
}

// Helper to get or create object store
function getObjectStore(dbName: string, storeName: string) {
  const db = getDatabase(dbName);
  if (!db.has(storeName)) {
    db.set(storeName, new Map());
  }
  return db.get(storeName)!;
}

// Mock IDBDatabase
class MockIDBDatabase {
  name: string;
  version: number;
  objectStoreNames: DOMStringList;

  constructor(dbName: string, version: number) {
    this.name = dbName;
    this.version = version;

    const db = getDatabase(dbName);
    this.objectStoreNames = {
      contains: (name: string) => db.has(name),
      item: (index: number) => Array.from(db.keys())[index] || null,
      length: db.size,
      [Symbol.iterator]: function* () {
        yield* db.keys();
      },
    } as DOMStringList;
  }

  createObjectStore(name: string, options?: { keyPath?: string }) {
    getObjectStore(this.name, name);
    return { keyPath: options?.keyPath || "id" };
  }

  transaction(
    storeNames: string | string[],
    mode: IDBTransactionMode = "readonly"
  ) {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames];
    return new MockIDBTransaction(this.name, names, mode);
  }

  close() {
    // No-op
  }
}

// Mock IDBTransaction
class MockIDBTransaction {
  dbName: string;
  objectStoreNames: DOMStringList;
  mode: IDBTransactionMode;
  oncomplete: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  error: DOMException | null = null;

  constructor(dbName: string, storeNames: string[], mode: IDBTransactionMode) {
    this.dbName = dbName;
    this.mode = mode;
    this.objectStoreNames = {
      contains: (name: string) => storeNames.includes(name),
      item: (index: number) => storeNames[index] || null,
      length: storeNames.length,
      [Symbol.iterator]: function* () {
        yield* storeNames;
      },
    } as DOMStringList;

    // Auto-complete transaction after microtask queue flushes
    Promise.resolve().then(() => {
      if (this.oncomplete) {
        this.oncomplete(new Event("complete"));
      }
    });
  }

  objectStore(name: string) {
    return new MockIDBObjectStore(this.dbName, name);
  }

  abort() {
    // No-op
  }
}

// Mock IDBObjectStore
class MockIDBObjectStore {
  dbName: string;
  name: string;

  constructor(dbName: string, storeName: string) {
    this.dbName = dbName;
    this.name = storeName;
  }

  private getStore() {
    return getObjectStore(this.dbName, this.name);
  }

add(value: { id: string }): IDBRequest {
    const store = this.getStore();
    const request: { result?: unknown; onsuccess?: ((event: { target: typeof request }) => void) } = {};

    Promise.resolve().then(() => {
      store.set(value.id, value);
      request.result = value.id;
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    });

    return request as IDBRequest;
  }

put(value: { id: string }): IDBRequest {
    const store = this.getStore();
    const request: { result?: unknown; onsuccess?: ((event: { target: typeof request }) => void) } = {};

    Promise.resolve().then(() => {
      store.set(value.id, value);
      request.result = value.id;
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    });

    return request as IDBRequest;
  }

get(key: string): IDBRequest {
    const store = this.getStore();
    const request: { result?: unknown; onsuccess?: ((event: { target: typeof request }) => void) } = {};

    Promise.resolve().then(() => {
      request.result = store.get(key) || undefined;
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    });

    return request as IDBRequest;
  }

getAll(): IDBRequest {
    const store = this.getStore();
    const request: { result?: unknown; onsuccess?: ((event: { target: typeof request }) => void) } = {};

    Promise.resolve().then(() => {
      request.result = Array.from(store.values());
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    });

    return request as IDBRequest;
  }

clear(): IDBRequest {
    const store = this.getStore();
    const request: { result?: unknown; onsuccess?: ((event: { target: typeof request }) => void) } = {};

    Promise.resolve().then(() => {
      store.clear();
      request.result = undefined;
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    });

    return request as IDBRequest;
  }

delete(key: string): IDBRequest {
    const store = this.getStore();
    const request: { result?: unknown; onsuccess?: ((event: { target: typeof request }) => void) } = {};

    Promise.resolve().then(() => {
      store.delete(key);
      request.result = undefined;
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    });

    return request as IDBRequest;
  }
}

// Mock IDBOpenDBRequest
class MockIDBOpenDBRequest {
  result: unknown = null;
  error: unknown = null;
  onsuccess: ((event: { target: MockIDBOpenDBRequest }) => void) | null = null;
  onerror: ((event: { target: MockIDBOpenDBRequest }) => void) | null = null;
  onupgradeneeded: ((event: { target: { result: MockIDBDatabase; transaction: MockIDBTransaction }; oldVersion: number; newVersion: number }) => void) | null = null;
  transaction: IDBTransaction | null = null;

  constructor(dbName: string, version: number) {
    Promise.resolve().then(() => {
      const db = new MockIDBDatabase(dbName, version);
      const dbStorage = getDatabase(dbName);

      // Trigger upgrade if database is new or version changed
      if (dbStorage.size === 0 && this.onupgradeneeded) {
        this.transaction = new MockIDBTransaction(
          dbName,
          [],
          "versionchange"
) as MockIDBTransaction;
        const upgradeEvent = {
          target: { result: db, transaction: this.transaction },
          oldVersion: 0,
          newVersion: version,
        };
        this.onupgradeneeded(upgradeEvent);
      }

      this.result = db;
      if (this.onsuccess) {
        this.onsuccess({ target: this });
      }
    });
  }
}

// Mock indexedDB
const mockIndexedDB = {
open(name: string, version: number = 1): IDBOpenDBRequest {
    return new MockIDBOpenDBRequest(name, version) as IDBOpenDBRequest;
  },

deleteDatabase(name: string): IDBOpenDBRequest {
    const request: { result?: unknown; onsuccess?: ((event: { target: typeof request }) => void) } = {};

    Promise.resolve().then(() => {
      databases.delete(name);
      request.result = undefined;
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    });

    return request as IDBOpenDBRequest;
  },

  async databases() {
    return Array.from(databases.keys()).map((name) => ({
      name,
      version: 1,
    }));
  },

  cmp(a: unknown, b: unknown) {
    return a < b ? -1 : a > b ? 1 : 0;
  },
};

// Install mocks globally
(globalThis as { indexedDB: typeof mockIndexedDB }).indexedDB = mockIndexedDB;
(globalThis as { IDBDatabase: typeof MockIDBDatabase }).IDBDatabase = MockIDBDatabase;
(globalThis as { IDBObjectStore: typeof MockIDBObjectStore }).IDBObjectStore = MockIDBObjectStore;
(globalThis as { IDBTransaction: typeof MockIDBTransaction }).IDBTransaction = MockIDBTransaction;
(globalThis as { IDBRequest: typeof MockIDBRequest }).IDBRequest = class MockIDBRequest {};

// Clean up between tests
afterEach(() => {
  databases.clear();
  localStorage.clear();
});

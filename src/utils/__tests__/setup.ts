import { afterEach } from 'vitest';

// In-memory storage for our mock IndexedDB
const databases = new Map<string, Map<string, Map<string, any>>>();

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
      }
    } as DOMStringList;
  }

  createObjectStore(name: string, options?: any) {
    getObjectStore(this.name, name);
    return { keyPath: options?.keyPath || 'id' };
  }

  transaction(storeNames: string | string[], mode: IDBTransactionMode = 'readonly') {
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
  
  constructor(dbName: string, storeNames: string[], mode: IDBTransactionMode) {
    this.dbName = dbName;
    this.mode = mode;
    this.objectStoreNames = {
      contains: (name: string) => storeNames.includes(name),
      item: (index: number) => storeNames[index] || null,
      length: storeNames.length,
      [Symbol.iterator]: function* () {
        yield* storeNames;
      }
    } as DOMStringList;
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

  add(value: any): IDBRequest {
    const store = this.getStore();
    const request: any = {};
    
    Promise.resolve().then(() => {
      store.set(value.id, value);
      request.result = value.id;
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    });
    
    return request as IDBRequest;
  }

  put(value: any): IDBRequest {
    const store = this.getStore();
    const request: any = {};
    
    Promise.resolve().then(() => {
      store.set(value.id, value);
      request.result = value.id;
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    });
    
    return request as IDBRequest;
  }

  get(key: any): IDBRequest {
    const store = this.getStore();
    const request: any = {};
    
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
    const request: any = {};
    
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
    const request: any = {};
    
    Promise.resolve().then(() => {
      store.clear();
      request.result = undefined;
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    });
    
    return request as IDBRequest;
  }

  delete(key: any): IDBRequest {
    const store = this.getStore();
    const request: any = {};
    
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
  result: any = null;
  error: any = null;
  onsuccess: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onupgradeneeded: ((event: any) => void) | null = null;
  transaction: IDBTransaction | null = null;

  constructor(dbName: string, version: number) {
    Promise.resolve().then(() => {
      const db = new MockIDBDatabase(dbName, version);
      const dbStorage = getDatabase(dbName);
      
      // Trigger upgrade if database is new or version changed
      if (dbStorage.size === 0 && this.onupgradeneeded) {
        this.transaction = new MockIDBTransaction(dbName, [], 'versionchange') as any;
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
    return new MockIDBOpenDBRequest(name, version) as any;
  },

  deleteDatabase(name: string): IDBOpenDBRequest {
    const request: any = {};
    
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
    return Array.from(databases.keys()).map(name => ({
      name,
      version: 1,
    }));
  },

  cmp(a: any, b: any) {
    return a < b ? -1 : a > b ? 1 : 0;
  },
};

// Install mocks globally
(globalThis as any).indexedDB = mockIndexedDB;
(globalThis as any).IDBDatabase = MockIDBDatabase;
(globalThis as any).IDBObjectStore = MockIDBObjectStore;
(globalThis as any).IDBTransaction = MockIDBTransaction;
(globalThis as any).IDBRequest = class MockIDBRequest {};

// Clean up between tests
afterEach(() => {
  databases.clear();
  localStorage.clear();
});

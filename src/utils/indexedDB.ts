const DB_NAME = 'TarkovQuests';
const DB_VERSION = 3;
const TASKS_STORE = 'completedTasks';
const COLLECTOR_STORE = 'completedCollectorItems';
const PRESTIGE_STORE = 'prestigeProgress';

export class TaskStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(TASKS_STORE)) {
          db.createObjectStore(TASKS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(COLLECTOR_STORE)) {
          db.createObjectStore(COLLECTOR_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(PRESTIGE_STORE)) {
          db.createObjectStore(PRESTIGE_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  async saveCompletedTasks(completedTasks: Set<string>): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([TASKS_STORE], 'readwrite');
    const store = transaction.objectStore(TASKS_STORE);
    
    await store.clear();
    
    for (const taskId of completedTasks) {
      await store.add({ id: taskId, completed: true });
    }
  }

  async loadCompletedTasks(): Promise<Set<string>> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TASKS_STORE], 'readonly');
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const completedTasks = new Set<string>();
        request.result.forEach((item: { id: string }) => {
          completedTasks.add(item.id);
        });
        resolve(completedTasks);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async saveCompletedCollectorItems(completedItems: Set<string>): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([COLLECTOR_STORE], 'readwrite');
    const store = transaction.objectStore(COLLECTOR_STORE);
    
    await store.clear();
    
    for (const itemName of completedItems) {
      await store.add({ id: itemName, completed: true });
    }
  }

  async loadCompletedCollectorItems(): Promise<Set<string>> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([COLLECTOR_STORE], 'readonly');
      const store = transaction.objectStore(COLLECTOR_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const completedItems = new Set<string>();
        request.result.forEach((item: { id: string }) => {
          completedItems.add(item.id);
        });
        resolve(completedItems);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async savePrestigeProgress(id: string, data: unknown): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction([PRESTIGE_STORE], 'readwrite');
    const store = tx.objectStore(PRESTIGE_STORE);
    await store.put({ id, data });
  }

  async loadPrestigeProgress<T = unknown>(id: string): Promise<T | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([PRESTIGE_STORE], 'readonly');
      const store = tx.objectStore(PRESTIGE_STORE);
      const req = store.get(id);
      req.onsuccess = () => {
        resolve((req.result?.data as T) ?? null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async clearAllPrestigeProgress(): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction([PRESTIGE_STORE], 'readwrite');
    const store = tx.objectStore(PRESTIGE_STORE);
    await store.clear();
  }
}

export const taskStorage = new TaskStorage();
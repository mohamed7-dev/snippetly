export type IndexDefinition = {
    name: string;
    keyPath: string | string[];
    options?: IDBIndexParameters;
};

export type StoreDefinition = {
    name: string;
    keyPath?: string;
    indexes?: IndexDefinition[];
};

export type UpgradeHandler = (db: IDBDatabase, tx: IDBTransaction) => void;

export const DB_VERSION = 1;

export async function openDB(
    dbName: string,
    version: number,
    onUpgrade: UpgradeHandler,
): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);

        request.onupgradeneeded = () => {
            const db = request.result;
            const tx = request.transaction;

            if (!tx) {
                reject(new Error('Upgrade transaction is unavailable'));
                return;
            }

            onUpgrade(db, tx);
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function ensureStore(
    db: IDBDatabase,
    tx: IDBTransaction,
    definition: StoreDefinition,
): IDBObjectStore {
    let store: IDBObjectStore;

    if (!db.objectStoreNames.contains(definition.name)) {
        store = db.createObjectStore(definition.name, {
            keyPath: definition.keyPath ?? 'id',
        });
    } else {
        store = tx.objectStore(definition.name);
    }

    for (const index of definition.indexes ?? []) {
        if (!store.indexNames.contains(index.name)) {
            store.createIndex(index.name, index.keyPath, index.options);
        }
    }

    return store;
}

export async function withStore<T = void>(
    definition: StoreDefinition,
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore, tx: IDBTransaction) => Promise<T> | T,
    dbName: string,
    version: number = DB_VERSION,
): Promise<T> {
    const db = await openDB(dbName, version, (db, tx) => {
        ensureStore(db, tx, definition);
    });

    try {
        const tx = db.transaction(definition.name, mode);
        const store = tx.objectStore(definition.name);

        const result = await fn(store, tx);

        await new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
        });

        return result;
    } finally {
        db.close();
    }
}

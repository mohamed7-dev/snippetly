export type UpgradeHandler = (db: IDBDatabase) => void

export async function openDB(
  dbName: string,
  version: number,
  onUpgrade: UpgradeHandler,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, version)
    req.onupgradeneeded = () => {
      const db = req.result
      onUpgrade(db)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export const DB_VERSION = 1

export function ensureStore(db: IDBDatabase, storeName: string) {
  if (!db.objectStoreNames.contains(storeName)) {
    db.createObjectStore(storeName, { keyPath: 'id' })
  }
}

export async function withStore<T = void>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore, tx: IDBTransaction) => Promise<T> | T,
  dbName: string,
  version: number = DB_VERSION,
): Promise<T> {
  const db = await openDB(dbName, version, (db) => ensureStore(db, storeName))
  try {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    const result = await fn(store, tx)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    return result
  } finally {
    db.close()
  }
}

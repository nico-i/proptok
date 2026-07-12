// IndexedDB wrapper (idb): persist takes as Blobs. Codec-agnostic — the blob's
// own type is preserved so playback/download derive format from stored data.
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface Take {
  id: string;
  blob: Blob;
  mimeType: string;
  createdAt: number;
}

interface PropTokDB extends DBSchema {
  takes: {
    key: string;
    value: Take;
    indexes: { createdAt: number };
  };
}

const DB_NAME = "proptok";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PropTokDB>> | null = null;

function db(): Promise<IDBPDatabase<PropTokDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PropTokDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        const store = database.createObjectStore("takes", { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      },
    });
  }
  return dbPromise;
}

function newId(): string {
  return crypto.randomUUID();
}

export async function saveTake(blob: Blob): Promise<Take> {
  const take: Take = {
    id: newId(),
    blob,
    mimeType: blob.type,
    createdAt: Date.now(),
  };
  await (await db()).put("takes", take);
  return take;
}

export async function listTakes(): Promise<Take[]> {
  return (await db()).getAllFromIndex("takes", "createdAt");
}

export async function getTake(id: string): Promise<Take | undefined> {
  return (await db()).get("takes", id);
}

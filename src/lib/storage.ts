// IndexedDB wrapper (idb): persist takes as base64 data URLs. The recording is
// read from its Blob into a `data:` URL so the stored value is self-contained —
// it plays back and downloads directly as an anchor href without needing a live
// object URL. Codec-agnostic: the data URL carries the blob's own mimeType.
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface Take {
  id: string;
  dataUrl: string;
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

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function saveTake(blob: Blob): Promise<Take> {
  const take: Take = {
    id: newId(),
    dataUrl: await toDataUrl(blob),
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

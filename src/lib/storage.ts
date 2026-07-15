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

// A video the prop master has published to the parody feed. Media is a
// self-contained base64 data URL (same rationale as Take); the remaining
// fields imitate TikTok's engagement metadata and are pure props.
export interface FeedVideo {
  id: string;
  dataUrl: string;
  mimeType: string;
  username: string;
  description: string;
  soundName: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  createdAt: number;
  order: number;
}

interface PropTokDB extends DBSchema {
  takes: {
    key: string;
    value: Take;
    indexes: { createdAt: number };
  };
  feed: {
    key: string;
    value: FeedVideo;
    indexes: { order: number };
  };
}

const DB_NAME = "proptok";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<PropTokDB>> | null = null;

function db(): Promise<IDBPDatabase<PropTokDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PropTokDB>(DB_NAME, DB_VERSION, {
      upgrade(database, oldVersion) {
        if (oldVersion < 1) {
          const takes = database.createObjectStore("takes", { keyPath: "id" });
          takes.createIndex("createdAt", "createdAt");
        }
        if (oldVersion < 2) {
          const feed = database.createObjectStore("feed", { keyPath: "id" });
          feed.createIndex("order", "order");
        }
      },
    });
  }
  return dbPromise;
}

export function newId(): string {
  return crypto.randomUUID();
}

export function toDataUrl(blob: Blob): Promise<string> {
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

export async function saveFeedVideo(video: FeedVideo): Promise<FeedVideo> {
  await (await db()).put("feed", video);
  return video;
}

export async function listFeedVideos(): Promise<FeedVideo[]> {
  return (await db()).getAllFromIndex("feed", "order");
}

export async function updateFeedVideo(
  id: string,
  patch: Partial<Omit<FeedVideo, "id">>,
): Promise<FeedVideo | undefined> {
  const database = await db();
  const existing = await database.get("feed", id);
  if (!existing) return undefined;
  const next: FeedVideo = { ...existing, ...patch };
  await database.put("feed", next);
  return next;
}

export async function deleteFeedVideo(id: string): Promise<void> {
  await (await db()).delete("feed", id);
}

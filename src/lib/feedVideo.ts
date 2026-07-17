// Pure construction of a FeedVideo from prop-master form input. Kept out of the
// storage module so it is unit-testable without IndexedDB. The media data URL
// and id/timestamp are supplied by the caller (which reads the file and mints
// the id via storage helpers), keeping this free of IO and randomness.
import type { FeedVideo } from "./storage";

export interface FeedVideoInput {
  username: string;
  description: string;
  soundName: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

export interface FeedVideoMedia {
  id: string;
  dataUrl: string;
  mimeType: string;
  createdAt: number;
  order: number;
}

function normalizeUsername(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "@user";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function buildFeedVideo(
  media: FeedVideoMedia,
  input: FeedVideoInput,
): FeedVideo {
  return {
    id: media.id,
    dataUrl: media.dataUrl,
    mimeType: media.mimeType,
    createdAt: media.createdAt,
    order: media.order,
    username: normalizeUsername(input.username),
    description: input.description.trim(),
    soundName: input.soundName.trim() || "original sound",
    likes: nonNegative(input.likes),
    comments: nonNegative(input.comments),
    shares: nonNegative(input.shares),
    saves: nonNegative(input.saves),
  };
}

// Extracts the editable metadata from a stored video so the setup form can be
// repopulated for editing. The username keeps its @ prefix, which makes a
// subsequent buildFeedVideo pass idempotent.
export function feedVideoToInput(video: FeedVideo): FeedVideoInput {
  return {
    username: video.username,
    description: video.description,
    soundName: video.soundName,
    likes: video.likes,
    comments: video.comments,
    shares: video.shares,
    saves: video.saves,
  };
}

// Compact display for large engagement counts, e.g. 12500 -> "12.5K".
export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    return `${trimZero(value / 1000)}K`;
  }
  return `${trimZero(value / 1_000_000)}M`;
}

function trimZero(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

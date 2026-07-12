// Export a recorded take to device storage via the Web Share API. The OS sheet
// lets the user save to Photos/Files. Requires a user gesture. Codec-agnostic:
// the file extension is derived from the blob's own mimeType.

export type ShareResult = "shared" | "unsupported" | "cancelled" | "failed";

function extensionFor(mimeType: string): string {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("webm")) return "webm";
  return "video";
}

export function toTakeFile(blob: Blob, createdAt: number): File {
  const stamp = new Date(createdAt).toISOString().replace(/[:.]/g, "-");
  return new File([blob], `proptok-${stamp}.${extensionFor(blob.type)}`, {
    type: blob.type,
  });
}

export async function shareTake(file: File): Promise<ShareResult> {
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  const data: ShareData = { files: [file], title: "PropTok take" };

  if (!nav.share || !nav.canShare?.(data)) return "unsupported";

  try {
    await nav.share(data);
    return "shared";
  } catch (err) {
    // iOS/Android report a user-dismissed sheet as an AbortError.
    if (err instanceof DOMException && err.name === "AbortError")
      return "cancelled";
    return "failed";
  }
}

// Fallback for platforms without file sharing (e.g. desktop browsers): trigger
// a normal download so the take still lands in the user's file system.
export function downloadTake(file: File): void {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// Save the take to device storage: share sheet where supported, otherwise a
// download. Returns whether the user ended up with the file (best-effort).
export async function saveTakeToDevice(file: File): Promise<boolean> {
  const result = await shareTake(file);
  if (result === "shared") return true;
  if (result === "cancelled" || result === "failed") return false;
  // unsupported → fall back to download.
  downloadTake(file);
  return true;
}

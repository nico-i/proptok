// Export a recorded take to the device by downloading it. The take is stored as
// a base64 `data:` URL, so the download is a plain anchor whose href IS that data
// URL — no object URL to create or revoke. Codec-agnostic: the file extension is
// derived from the take's mimeType.
import type { Take } from "./storage";

function extensionFor(mimeType: string): string {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("webm")) return "webm";
  return "video";
}

export function fileNameFor(take: Take): string {
  const stamp = new Date(take.createdAt).toISOString().replace(/[:.]/g, "-");
  return `proptok-${stamp}.${extensionFor(take.mimeType)}`;
}

export function downloadTake(take: Take): void {
  const anchor = document.createElement("a");
  anchor.href = take.dataUrl;
  anchor.download = fileNameFor(take);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
